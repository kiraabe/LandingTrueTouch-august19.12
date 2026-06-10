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

    while (remaining && remaining.length > 0) {
      remaining = remaining.trim();

      if (remaining.startsWith('{') && remaining.endsWith('}')) {
        let content = remaining.slice(1, -1).trim();
        remaining = '';

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
            if (currentItem.trim()) {
              const cleaned = cleanSkillItem(currentItem.trim());
              if (cleaned) skills.push(cleaned);
            }
            currentItem = '';
          } else {
            currentItem += char;
          }
        }

        if (currentItem.trim()) {
          const cleaned = cleanSkillItem(currentItem.trim());
          if (cleaned) skills.push(cleaned);
        }
      } else {
        skills.push(remaining);
        remaining = '';
      }
    }

    if (skills.length === 0) return null;
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

  if ((item.startsWith('"') && item.endsWith('"')) ||
      (item.startsWith("'") && item.endsWith("'"))) {
    item = item.slice(1, -1);
  }

  item = item.replace(/\\"/g, '"').replace(/\\'/g, "'");

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

    if (languageSkills.startsWith('{') && languageSkills.endsWith('}')) {
      let content = languageSkills.slice(1, -1);
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
          currentElement = '';
        } else {
          currentElement += char;
        }
      }

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
      try {
        const parsed = JSON.parse(languageSkills);
        if (Array.isArray(parsed)) {
          skills.push(...parsed);
        } else {
          skills.push(parsed);
        }
      } catch (e) {
        if (languageSkills) skills.push(languageSkills);
      }
    }

    if (skills.length === 0) return null;
    const unique = [...new Set(skills)];
    console.log('🔧 parseLanguageSkills result:', unique);
    return unique;

  } catch (e) {
    console.error('Error parsing language_skills:', e);
    return languageSkills;
  }
};

// Image proxy endpoint
router.get('/proxy-image', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'Missing url parameter' });

    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 10000,
      maxRedirects: 10,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    res.set('Content-Type', response.headers['content-type']);
    res.set('Cache-Control', 'public, max-age=3600');
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.send(response.data);
  } catch (error) {
    console.error('✗ Image proxy error:', error.message);
    res.status(404).json({ error: 'Failed to fetch image', details: error.message });
  }
});

// Debug endpoint
router.get('/candidates/debug', async (req, res) => {
  try {
    const tableExists = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_name = 'candidates'"
    );

    if (tableExists.rows.length === 0) {
      return res.status(500).json({ error: 'Candidates table does not exist' });
    }

    const allCandidates = await pool.query('SELECT candidate_id, id, name FROM candidates ORDER BY id');
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

// List all candidates
router.get('/candidates/list-all', async (req, res) => {
  try {
    const result = await pool.query('SELECT candidate_id, id, name FROM candidates ORDER BY id LIMIT 50');
    res.json(result.rows);
  } catch (error) {
    console.error('✗ Database query error:', error.message);
    res.status(500).json({ error: 'Failed to fetch candidates list', details: error.message });
  }
});

// Featured candidates — status normalized to lowercase
router.get('/candidates/featured', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        candidate_id AS id,
        id AS numeric_id,
        name AS full_name,
        job_category AS profession,
        current_location AS location,
        profile_picture,
        religion AS hourly_rate,
        LOWER(COALESCE(status, 'no status')) AS status,
        skill_level
      FROM candidates
      WHERE profile_picture IS NOT NULL
      LIMIT 100
    `);
    console.log('✓ Fetched featured candidates, count:', result.rows.length);
    res.json(result.rows);
  } catch (error) {
    console.error('✗ Database query error:', error.message);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

// Filter options — skill_level unnested and cleaned from PostgreSQL array format
router.get('/candidates/filter-options', async (req, res) => {
  try {
    console.log('🔍 Fetching filter options...');

    // Job categories — distinct clean values
    const professions = await pool.query(`
      SELECT DISTINCT TRIM(job_category) AS profession
      FROM candidates
      WHERE profile_picture IS NOT NULL
        AND job_category IS NOT NULL
        AND TRIM(job_category) != ''
      ORDER BY profession
    `);
    console.log('✓ Professions found:', professions.rows.length, professions.rows.slice(0, 3));

    // Locations — distinct clean values
    const locations = await pool.query(`
      SELECT DISTINCT TRIM(current_location) AS location
      FROM candidates
      WHERE profile_picture IS NOT NULL
        AND current_location IS NOT NULL
        AND TRIM(current_location) != ''
      ORDER BY location
    `);
    console.log('✓ Locations found:', locations.rows.length, locations.rows.slice(0, 3));

    // Skill levels — unnest PostgreSQL array, clean braces/quotes, deduplicate
    const skillLevels = await pool.query(`
      SELECT DISTINCT TRIM(skill) AS skill
      FROM (
        SELECT UNNEST(
          string_to_array(
            regexp_replace(skill_level, '[{}"]', '', 'g'),
            ','
          )
        ) AS skill
        FROM candidates
        WHERE profile_picture IS NOT NULL
          AND skill_level IS NOT NULL
          AND skill_level != ''
      ) AS skills_expanded
      WHERE TRIM(skill) != ''
      ORDER BY skill
    `);
    console.log('✓ Skill levels found:', skillLevels.rows.length, skillLevels.rows.slice(0, 3));

    // Statuses — normalized to lowercase
    const statuses = await pool.query(`
      SELECT DISTINCT LOWER(TRIM(status)) AS status
      FROM candidates
      WHERE profile_picture IS NOT NULL
        AND status IS NOT NULL
        AND TRIM(status) != ''
      ORDER BY status
    `);
    console.log('✓ Statuses found:', statuses.rows.length, statuses.rows.slice(0, 3));

    const response = {
      professions: professions.rows.map(r => r.profession).filter(Boolean),
      locations: locations.rows.map(r => r.location).filter(Boolean),
      skillLevels: skillLevels.rows.map(r => r.skill).filter(Boolean),
      statuses: statuses.rows.map(r => r.status).filter(Boolean)
    };

    console.log('✅ Filter options response:', JSON.stringify(response));

    // Provide default values if no data found
    if (response.professions.length === 0) {
      response.professions = ['Software Developer', 'Data Scientist', 'Housekeeper', 'Chef'];
    }
    if (response.locations.length === 0) {
      response.locations = ['New York', 'Los Angeles', 'London', 'Dubai'];
    }
    if (response.skillLevels.length === 0) {
      response.skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
    }
    if (response.statuses.length === 0) {
      response.statuses = ['available', 'hired', 'pending'];
    }

    res.json(response);
  } catch (error) {
    console.error('✗ Filter options error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch filter options',
      details: error.message,
      professions: [],
      locations: [],
      skillLevels: [],
      statuses: []
    });
  }
});

// Single candidate by UUID
router.get('/candidates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📌 Fetching candidate with UUID: ${id}`);

    if (!id) return res.status(400).json({ error: 'Invalid candidate ID' });

    const result = await pool.query(
      'SELECT * FROM candidates WHERE candidate_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Candidate not found with ID: ${id}` });
    }

    const candidate = result.rows[0];
    const parsedSkillLevel = parseSkillLevel(candidate.skill_level);
    const parsedLanguageSkills = parseLanguageSkills(candidate.language_skills);

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

    console.log(`✓ Returning candidate: ${response.full_name}`);
    res.json(response);
  } catch (error) {
    console.error('✗ Database query error:', error);
    res.status(500).json({ error: 'Failed to fetch candidate', details: error.message });
  }
});

module.exports = router;
