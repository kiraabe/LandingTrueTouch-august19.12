const express = require('express');
const pool = require('../db');
const axios = require('axios');

const router = express.Router();

// Helper function to parse PostgreSQL array of JSON strings and extract all skills
const parseSkillLevel = (skillLevel) => {
  console.log('🔧 parseSkillLevel called with:', skillLevel);
  if (!skillLevel) return null;

  try {
    if (typeof skillLevel !== 'string') return skillLevel;

    const skills = [];
    let remaining = skillLevel;

    // Try to recursively parse the structure
    while (remaining && remaining.length > 0) {
      remaining = remaining.trim();

      if (remaining.startsWith('{') && remaining.endsWith('}')) {
        // Remove outer braces
        let content = remaining.slice(1, -1).trim();
        remaining = '';

        // Parse comma-separated quoted strings
        let currentItem = '';
        let inQuotes = false;
        let inEscape = false;
        let depth = 0;

        for (let i = 0; i < content.length; i++) {
          const char = content[i];

          if (inEscape) {
            currentItem += char;
            inEscape = false;
            continue;
          }

          if (char === '\\' && inQuotes) {
            currentItem += char;
            inEscape = true;
            continue;
          }

          if (char === '"' && !inEscape) {
            inQuotes = !inQuotes;
            currentItem += char;
            continue;
          }

          if (char === '{' && !inQuotes) {
            depth++;
            currentItem += char;
            continue;
          }

          if (char === '}' && !inQuotes) {
            depth--;
            currentItem += char;
            continue;
          }

          if (char === ',' && !inQuotes && depth === 0) {
            // End of current item
            if (currentItem.trim()) {
              const cleaned = cleanSkillItem(currentItem.trim());
              if (cleaned) skills.push(cleaned);
            }
            currentItem = '';
          } else {
            currentItem += char;
          }
        }

        // Process last item
        if (currentItem.trim()) {
          const cleaned = cleanSkillItem(currentItem.trim());
          if (cleaned) skills.push(cleaned);
        }
      } else {
        // Not a PostgreSQL array, try as plain string
        skills.push(remaining);
        remaining = '';
      }
    }

    // Remove duplicates and return all unique skills as comma-separated string
    if (skills.length === 0) {
      console.log('🔧 No skills extracted');
      return null;
    }
    const unique = [...new Set(skills)];
    const result = unique.join(', ');
    console.log('🔧 parseSkillLevel result:', result);
    return result;

  } catch (e) {
    console.error('Error parsing skill_level:', e);
    return skillLevel;
  }
};

// Helper to clean individual skill items
const cleanSkillItem = (item) => {
  if (!item) return null;

  // Remove surrounding quotes if they exist
  if ((item.startsWith('"') && item.endsWith('"')) ||
      (item.startsWith("'") && item.endsWith("'"))) {
    item = item.slice(1, -1);
  }

  // Unescape quotes
  item = item.replace(/\\"/g, '"').replace(/\\'/g, "'");

  // Try to parse if it's JSON
  if (item.startsWith('{') || item.startsWith('[')) {
    try {
      const parsed = JSON.parse(item);
      if (Array.isArray(parsed)) {
        return parsed.join(', ');
      } else if (typeof parsed === 'string') {
        return parsed;
      }
    } catch (e) {
      // Not JSON, return as-is
    }
  }

  // Clean up any remaining quotes or braces
  item = item.replace(/[\{\}\"]/g, '').trim();

  return item && item.length > 0 ? item : null;
};

// Helper function to parse and deduplicate language_skills
const parseLanguageSkills = (languageSkills) => {
  console.log('🔧 parseLanguageSkills called with:', languageSkills);
  if (!languageSkills) return null;

  try {
    if (typeof languageSkills !== 'string') return languageSkills;

    const skills = [];

    // Handle PostgreSQL array format: {element1, element2, ...}
    if (languageSkills.startsWith('{') && languageSkills.endsWith('}')) {
      // Extract content between braces
      let content = languageSkills.slice(1, -1);

      // Split by }, but keep track of quoted strings
      let currentElement = '';
      let inQuotes = false;
      let inEscape = false;

      for (let i = 0; i < content.length; i++) {
        const char = content[i];

        if (inEscape) {
          currentElement += char;
          inEscape = false;
          continue;
        }

        if (char === '\\') {
          currentElement += char;
          inEscape = true;
          continue;
        }

        if (char === '"') {
          inQuotes = !inQuotes;
          currentElement += char;
          continue;
        }

        if (char === ',' && !inQuotes) {
          // End of current element
          if (currentElement.trim()) {
            const trimmed = currentElement.trim().replace(/^"|"$/g, '');
            const unescaped = trimmed.replace(/\\"/g, '"');

            try {
              const parsed = JSON.parse(unescaped);
              if (Array.isArray(parsed)) {
                skills.push(...parsed);
              } else {
                skills.push(parsed);
              }
            } catch (e) {
              // If not valid JSON, add as-is
              if (unescaped) skills.push(unescaped);
            }
          }
          currentElement = '';
        } else {
          currentElement += char;
        }
      }

      // Process last element
      if (currentElement.trim()) {
        const trimmed = currentElement.trim().replace(/^"|"$/g, '');
        const unescaped = trimmed.replace(/\\"/g, '"');

        try {
          const parsed = JSON.parse(unescaped);
          if (Array.isArray(parsed)) {
            skills.push(...parsed);
          } else {
            skills.push(parsed);
          }
        } catch (e) {
          if (unescaped) skills.push(unescaped);
        }
      }
    } else {
      // Try direct JSON parsing
      try {
        const parsed = JSON.parse(languageSkills);
        if (Array.isArray(parsed)) {
          skills.push(...parsed);
        } else {
          skills.push(parsed);
        }
      } catch (e) {
        // If not JSON, treat as plain string
        if (languageSkills) skills.push(languageSkills);
      }
    }

    // Remove duplicates and return as array
    if (skills.length === 0) {
      console.log('🔧 No language skills extracted');
      return null;
    }
    const unique = [...new Set(skills)];
    console.log('🔧 parseLanguageSkills result:', unique);
    return unique;

  } catch (e) {
    console.error('Error parsing language_skills:', e);
    return languageSkills;
  }
};

// Image proxy endpoint - serves images from external server
router.get('/proxy-image', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 10000,
      maxRedirects: 10,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const contentType = response.headers['content-type'];
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=3600');
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.send(response.data);
  } catch (error) {
    console.error('✗ Image proxy error for URL:', error.config?.url, 'Error:', error.message);
    res.status(404).json({ error: 'Failed to fetch image', details: error.message });
  }
});

// Specific routes BEFORE parameterized routes
router.get('/candidates/debug', async (req, res) => {
  try {
    console.log('✓ Debug endpoint hit');
    const tableExists = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_name = 'candidates'"
    );

    if (tableExists.rows.length === 0) {
      return res.status(500).json({ error: 'Candidates table does not exist' });
    }

    const allCandidates = await pool.query('SELECT candidate_id, id, name FROM candidates ORDER BY id');
    console.log(`✓ Found ${allCandidates.rows.length} candidates`);
    res.json({
      table_exists: true,
      total_candidates: allCandidates.rows.length,
      candidate_uuids: allCandidates.rows.map(c => c.candidate_id),
      sample: allCandidates.rows.slice(0, 5)
    });
  } catch (error) {
    console.error('✗ Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/candidates/list-all', async (req, res) => {
  try {
    const result = await pool.query('SELECT candidate_id, id, name FROM candidates ORDER BY id LIMIT 50');
    res.json(result.rows);
  } catch (error) {
    console.error('✗ Database query error:', error.message);
    res.status(500).json({ error: 'Failed to fetch candidates list', details: error.message });
  }
});

router.get('/candidates/featured', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT candidate_id AS id, id as numeric_id, name AS full_name, job_category AS profession, current_location AS location, profile_picture, religion AS hourly_rate, COALESCE(status, \'No Status\') as status, skill_level FROM candidates WHERE profile_picture IS NOT NULL LIMIT 100'
    );
    console.log('✓ Fetched featured candidates, count:', result.rows.length);
    console.log('✓ Sample UUIDs:', result.rows.map(r => r.id).slice(0, 2));
    res.json(result.rows);
  } catch (error) {
    console.error('✗ Database query error:', error.message);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

router.get('/candidates/filter-options', async (req, res) => {
  try {
    const professions = await pool.query(
      'SELECT DISTINCT job_category AS profession FROM candidates WHERE profile_picture IS NOT NULL AND job_category IS NOT NULL ORDER BY job_category'
    );

    const locations = await pool.query(
      'SELECT DISTINCT current_location AS location FROM candidates WHERE profile_picture IS NOT NULL AND current_location IS NOT NULL ORDER BY current_location'
    );

    const skillLevels = await pool.query(
      'SELECT DISTINCT skill_level FROM candidates WHERE profile_picture IS NOT NULL AND skill_level IS NOT NULL ORDER BY skill_level'
    );

    const statuses = await pool.query(
      'SELECT DISTINCT status FROM candidates WHERE profile_picture IS NOT NULL AND status IS NOT NULL ORDER BY status'
    );

    res.json({
      professions: professions.rows.map(r => r.profession),
      locations: locations.rows.map(r => r.location),
      skillLevels: skillLevels.rows.map(r => r.skill_level),
      statuses: statuses.rows.map(r => r.status)
    });
  } catch (error) {
    console.error('✗ Database query error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch filter options',
      professions: [],
      locations: [],
      skillLevels: [],
      statuses: []
    });
  }
});

// Parameterized route - AFTER specific routes
router.get('/candidates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📌 Fetching candidate with ID (UUID): ${id}`);

    if (!id) {
      return res.status(400).json({ error: 'Invalid candidate ID' });
    }

    const result = await pool.query(
      'SELECT * FROM candidates WHERE candidate_id = $1',
      [id]
    );

    console.log(`✓ Query result for candidate ${id}:`, result.rows.length, 'rows');

    if (result.rows.length === 0) {
      console.log(`✗ Candidate ${id} not found in database`);
      return res.status(404).json({ error: `Candidate not found with ID: ${id}` });
    }

    const candidate = result.rows[0];
    console.log('📊 Full candidate row from DB:', JSON.stringify(candidate, null, 2));
    console.log('🔍 Raw skill_level from DB:', candidate.skill_level);
    console.log('🔍 Type of skill_level:', typeof candidate.skill_level);

    const parsedSkillLevel = parseSkillLevel(candidate.skill_level);
    console.log('✅ Parsed skill_level:', parsedSkillLevel);

    const parsedLanguageSkills = parseLanguageSkills(candidate.language_skills);
    console.log('✅ Parsed language_skills:', parsedLanguageSkills);

    const response = {
      id: candidate.candidate_id,
      name: candidate.name,
      full_name: candidate.name,
      passport_number: candidate.passport_number,
      phone_number: candidate.phone_number,
      profile_picture: candidate.profile_picture,
      cv: candidate.cv,
      gender: candidate.gender,
      date_of_birth: candidate.date_of_birth,
      nationality: candidate.nationality,
      religion: candidate.religion,
      marital_status: candidate.marital_status,
      occupation: candidate.occupation,
      job_category: candidate.job_category,
      skill_level: parsedSkillLevel,
      education_level: candidate.education_level,
      language_skills: parsedLanguageSkills,
      city: candidate.city,
      current_location: candidate.current_location,
      resume_url: candidate.resume_url,
      medical_status: candidate.medical_status,
      status: candidate.status,
      job_title: candidate.job_category,
      location: candidate.current_location,
      hourly_rate: candidate.hourly_rate,
      bio: candidate.occupation,
      skills: parsedLanguageSkills,
      experience: candidate.occupation,
      education: candidate.education_level,
      portfolio: candidate.resume_url,
      about: candidate.occupation
    };

    console.log(`✓ Returning candidate:`, response.full_name);
    res.json(response);
  } catch (error) {
    console.error('✗ Database query error:', error);
    res.status(500).json({ error: 'Failed to fetch candidate', details: error.message });
  }
});

module.exports = router;
