import JobZImage from "../../../../common/jobz-img";
import GalleryLightbox from "../../../../common/gallery-lightbox";
import Spinner from "../../../../common/spinner";
import { loadScript, publicUrlFor, updateSkinStyle } from "../../../../../globals/constants";
import { publicUser } from "../../../../../globals/route-names";
import { downloadFileWithToast, showErrorToast, showSuccessToast } from "../../../../../globals/error-handler";
import { candidateProfileFallback, getCandidateProfilePictureUrl, getCandidateCvUrl, getJobImageUrl, getTestimonialAvatarUrl } from "../../../../../globals/file-url";
import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "../../../../../components/ui/toaster";
import "./cv-modal.css";
import "./hero-language.css";
import CountUp from "react-countup";
import AirplaneCircleHighlight from "./AirplaneCircleHighlight";

// Truncate text helper
const API_BASE_URL = '';
const COMPANY_WHATSAPP_NUMBER = "251935106635";
const MAP_SCRIPT_URL = "https://www.amcharts.com/lib/3/ammap.js?3.17.0";
const WORLD_MAP_SCRIPT_URL = "https://www.amcharts.com/lib/3/maps/js/worldLow.js";
const TARGET_SVG = "M9,0C4.029,0,0,4.029,0,9s4.029,9,9,9s9-4.029,9-9S13.971,0,9,0z M9,15.93c-3.83,0-6.93-3.1-6.93-6.93S5.17,2.07,9,2.07s6.93,3.1,6.93,6.93S12.83,15.93,9,15.93 M12.5,9c0,1.933-1.567,3.5-3.5,3.5S5.5,10.933,5.5,9S7.067,5.5,9,5.5S12.5,7.067,12.5,9z";
const PLANE_SVG = "m2,106h28l24,30h72l-44,-133h35l80,132h98c21,0,21,34,0,34l-98,0-80,134h-35l43,-133h-71l-24,30h-28l15,-47";

const loadExternalScript = (src, loaded) => {
  if (loaded()) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${src}"]`);
    const script = existingScript || document.createElement("script");

    const handleLoad = () => resolve();
    const handleError = () => reject(new Error(`Unable to load ${src}`));

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });

    if (!existingScript) {
      script.src = src;
      document.head.appendChild(script);
    }
  });
};

const candidateSearchCopy = {
  en: {
    showingCount: "Showing 0 of 0 candidates",
    noCandidatesAvailable: "No candidates available.",
    searchPlaceholder: "Search by name, profession, or location..."
  },
  ar: {
    showingCount: "عرض 0 من أصل 0 من المرشحين",
    noCandidatesAvailable: "لا يوجد مرشحون متاحون.",
    searchPlaceholder: "البحث بالاسم، أو المهنة، أو الموقع..."
  },
  am: {
    showingCount: "ከ 0 ውስጥ 0 ዕጩዎች ታይተዋል",
    noCandidatesAvailable: "ምንም ዓይነት ዕጩዎች አልተገኙም።",
    searchPlaceholder: "በስም፣ በሙያ ወይም በቦታ ይፈልጉ..."
  }
};

const buildWhatsAppLink = (candidate) => {
  const message =
    `Hello, I'm interested in this candidate:\n` +
    `Name: ${candidate.full_name || candidate.name || "N/A"}\n` +
    `Role: ${candidate.profession || candidate.job_category || candidate.job_title || "N/A"}\n` +
    `Location: ${candidate.location || candidate.current_location || candidate.city || "N/A"}\n` +
    `Status: ${candidate.status || "N/A"}\n\n` +
    `Could you share more details or help me proceed?`;

  return `whatsapp://send?phone=${COMPANY_WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
};

const truncateText = (text, maxLength = 78) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Parse skill_level for display (handles raw PostgreSQL array strings)
function parseSkillsForDisplay(skillLevel) {
  if (!skillLevel) return "-";
  try {
    let cleaned = skillLevel.replace(/\\+/g, "");
    cleaned = cleaned.replace(/[{}"]/g, "");
    const parts = cleaned.split(",").map(p => p.trim()).filter(s => s.length > 0);
    const seen = new Set();
    const unique = parts.filter(p => {
      const key = p.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return unique.length > 0 ? unique.join(", ") : "-";
  } catch (e) {
    return "-";
  }
}

// Parse language_skills for display as tags
const parseLanguageSkillsForDisplay = (skills) => {
  if (!skills) return [];

  if (Array.isArray(skills)) {
    const cleaned = skills
      .map(skill => typeof skill === 'string' ? skill.replace(/^[\{\"]|[\}\"]$/g, '').trim() : skill)
      .filter(skill => skill && skill.length > 0);
    return [...new Set(cleaned)];
  }

  if (typeof skills === 'string') {
    if (skills.startsWith('{') && skills.endsWith('}')) {
      let content = skills.slice(1, -1);
      const parsed = [];
      let currentItem = '';
      let inQuotes = false;

      for (let i = 0; i < content.length; i++) {
        const char = content[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          if (currentItem.trim()) {
            const cleaned = currentItem.trim().replace(/^"|"$/g, '').trim();
            if (cleaned) parsed.push(cleaned);
          }
          currentItem = '';
        } else {
          currentItem += char;
        }
      }

      if (currentItem.trim()) {
        const cleaned = currentItem.trim().replace(/^"|"$/g, '').trim();
        if (cleaned) parsed.push(cleaned);
      }

      return [...new Set(parsed)];
    }

    if (skills.includes(',')) {
      return [...new Set(skills.split(',').map(s => s.trim()).filter(s => s))];
    }

    return [skills.trim()];
  }

  return [];
};

function Home18Page() {
  const location = useLocation();
  const [allCandidates, setAllCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [testimonials, setTestimonials] = useState([]);
  const [pageReady, setPageReady] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(() => document.documentElement.lang || "am");
  const recruitmentMapRef = useRef(null);

  const downloadResume = (event, filename, label) => {
    event.preventDefault();
    downloadFileWithToast(
      getCandidateCvUrl(filename),
      filename,
      `The ${label} is not available for this candidate.`,
      `Failed to download ${label}. Please try again later.`
    );
  };

  // Search, filter, tab state
  const [searchQuery, setSearchQuery] = useState('');
  const [heroLocation, setHeroLocation] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({ jobCategory: '', preferredWorkCountry: '', skillLevel: '', religion: '', status: '' });
  const [filterOptions, setFilterOptions] = useState({ professions: [], preferredWorkCountries: [], skillLevels: [], religions: [], statuses: [] });

  useEffect(() => {
    document.title = 'Home | TrueTouch - Foreign Employment Recruitment Agency';
    loadScript("js/custom.js");
  }, []);

  useEffect(() => {
    let cancelled = false;
    let chart;

    const origin = { latitude: 9.0084, longitude: 38.7575 };
    const destinations = [
      { id: "doha", title: "Doha, Qatar", latitude: 25.2854, longitude: 51.5310 },
      { id: "amman", title: "Amman, Jordan", latitude: 31.9454, longitude: 35.9284 },
      { id: "riyadh", title: "Riyadh, Saudi Arabia", latitude: 24.7136, longitude: 46.6753 },
      { id: "kuwait-city", title: "Kuwait City, Kuwait", latitude: 29.3759, longitude: 47.9774 }
    ];

    const initializeMap = async () => {
      try {
        await loadExternalScript(MAP_SCRIPT_URL, () => Boolean(window.AmCharts));
        await loadExternalScript(WORLD_MAP_SCRIPT_URL, () => Boolean(window.AmCharts?.maps?.worldLow));

        if (cancelled || !recruitmentMapRef.current || !window.AmCharts) return;

        const lines = destinations.flatMap((destination) => [
          {
            id: `${destination.id}-route`,
            arc: -0.3,
            alpha: 0.3,
            latitudes: [origin.latitude, destination.latitude],
            longitudes: [origin.longitude, destination.longitude]
          },
          {
            id: `${destination.id}-animation-route`,
            alpha: 0,
            color: "#000000",
            latitudes: [origin.latitude, destination.latitude],
            longitudes: [origin.longitude, destination.longitude]
          }
        ]);
        const images = [
          {
            svgPath: TARGET_SVG,
            title: "Addis Ababa, Ethiopia",
            balloonText: "Addis Ababa, Ethiopia",
            ...origin
          },
          ...destinations.map(({ id, ...destination }) => ({
            svgPath: TARGET_SVG,
            balloonText: destination.title,
            ...destination
          })),
          ...destinations.flatMap((destination) => [
            {
              svgPath: PLANE_SVG,
              positionOnLine: 0,
              color: "#000000",
              alpha: 0.1,
              animateAlongLine: true,
              lineId: `${destination.id}-animation-route`,
              flipDirection: true,
              loop: true,
              scale: 0.03,
              positionScale: 1.3
            },
            {
              svgPath: PLANE_SVG,
              positionOnLine: 0,
              color: "#585869",
              animateAlongLine: true,
              lineId: `${destination.id}-route`,
              flipDirection: true,
              loop: true,
              scale: 0.03,
              positionScale: 1
            }
          ])
        ];

        chart = window.AmCharts.makeChart(recruitmentMapRef.current, {
          type: "map",
          fontSize: 20,
          balloon: { horizontalPadding: 20, verticalPadding: 15 },
          creditsPosition: "top-right",
          dragMap: false,
          mouseWheelZoomEnabled: false,
          zoomOnDoubleClick: false,
          zoomControl: { zoomControlEnabled: false, homeButtonEnabled: false },
          dataProvider: {
            map: "worldLow",
            zoomLevel: 2.5,
            zoomLongitude: 42,
            zoomLatitude: 18,
            lines,
            images
          },
          areasSettings: { unlistedAreasColor: "#8dd9ef" },
          imagesSettings: {
            color: "#585869",
            rollOverColor: "#585869",
            selectedColor: "#585869",
            pauseDuration: 0.5,
            animationDuration: 8,
            adjustAnimationSpeed: false
          },
          linesSettings: { color: "#585869", alpha: 0.4 }
        });
      } catch (error) {
        console.error("Recruitment map could not be loaded.", error);
      }
    };

    initializeMap();

    return () => {
      cancelled = true;
      chart?.clear();
    };
  }, []);

  useEffect(() => {
    const handleLanguageChange = (event) => setCurrentLanguage(event.detail.language);
    document.addEventListener("languagechange", handleLanguageChange);
    return () => document.removeEventListener("languagechange", handleLanguageChange);
  }, []);

  useEffect(() => {
    if (!window.jQuery?.fn?.owlCarousel) return;

    const timeoutId = setTimeout(() => {
      const carousel = window.jQuery('.twm-h1-bnr-carousal');
      if (!carousel.length) return;
      if (carousel.hasClass('owl-loaded')) carousel.trigger('destroy.owl.carousel');
      carousel.owlCarousel({
        animateIn: 'fadeIn',
        animateOut: 'fadeOut',
        items: 1,
        loop: true,
        nav: false,
        dots: false,
        autoplay: true,
        autoplayHoverPause: false,
        touchDrag: false,
        mouseDrag: false,
        rtl: currentLanguage === 'ar'
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [currentLanguage]);

  // Read search query from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    if (search) {
      setSearchQuery(search);
      setTimeout(() => {
        const element = document.getElementById('candidates');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location.search]);

  // Fetch candidates + filter options in parallel
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/candidates/featured`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const data = await response.json();
        const availableCandidates = data.filter(candidate =>
          candidate.status?.trim().toLowerCase() === 'available'
        );
        console.log('✅ Available candidates loaded:', availableCandidates.length);
        setAllCandidates(availableCandidates);
        setFilteredCandidates(availableCandidates);
        setFilterOptions(currentOptions => ({
          ...currentOptions,
          religions: [...new Set(availableCandidates.map(candidate => candidate.religion).filter(Boolean))]
        }));
      } catch (err) {
        console.error('❌ Error fetching candidates:', err);
        showErrorToast(err, 'Failed to load featured candidates.');
      } finally {
        setLoading(false);
      }
    };

    const fetchFilterOptions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/candidates/filter-options`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const data = await response.json();
        const cleanOptions = (options = []) => options
          .map(option => typeof option === 'string' ? option.replace(/\\+/g, '').replace(/[{}"]+/g, '').trim() : option)
          .filter(Boolean);
        setFilterOptions({
          professions: cleanOptions(data.professions),
          preferredWorkCountries: cleanOptions(data.preferredWorkCountries),
          religions: cleanOptions(data.religions),
          statuses: cleanOptions(data.statuses),
          skillLevels: cleanOptions(data.skillLevels)
        });
      } catch (err) {
        console.error('❌ Error fetching filter options:', err);
      }
    };

    fetchCandidates();
    fetchFilterOptions();
  }, []);

  // Apply all filters reactively — case-insensitive + trimmed comparisons
  useEffect(() => {
    let result = [...allCandidates];

    // Search across candidate text fields, including country and skills
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(candidate =>
        Object.values(candidate)
          .flatMap(value => Array.isArray(value) ? value : [value])
          .some(value => value !== null && value !== undefined && String(value).replace(/[{}"]+/g, '').toLowerCase().includes(q))
      );
    }

    // Job Category filter
    if (filters.jobCategory) {
      result = result.filter(c =>
        c.profession?.trim().toLowerCase() === filters.jobCategory.trim().toLowerCase()
      );
    }

    // Preferred work country filter
    if (filters.preferredWorkCountry) {
      result = result.filter(c =>
        c.preferred_work_country?.trim().toLowerCase() === filters.preferredWorkCountry.trim().toLowerCase()
      );
    }

    // Skill Level filter — candidate skill_level may be a comma-separated string
    // so we check if any parsed skill matches the selected value
    if (filters.skillLevel) {
      const selectedSkill = filters.skillLevel.trim().toLowerCase();
      result = result.filter(c => {
        if (!c.skill_level) return false;
        // Clean the raw skill_level string and check if it contains the selected skill
        const skillValues = Array.isArray(c.skill_level) ? c.skill_level : c.skill_level.split(',');
        const skillParts = skillValues
          .map(skill => String(skill).replace(/\\+/g, '').replace(/[{}"]+/g, '').trim().toLowerCase())
          .filter(Boolean);
        return skillParts.includes(selectedSkill);
      });
    }

    // Religion filter
    if (filters.religion) {
      result = result.filter(c =>
        c.religion?.trim().toLowerCase() === filters.religion.trim().toLowerCase()
      );
    }

    // Status filter — both sides normalized to lowercase in DB and here
    if (filters.status) {
      result = result.filter(c =>
        c.status?.trim().toLowerCase() === filters.status.trim().toLowerCase()
      );
    }

    setFilteredCandidates(result);
  }, [searchQuery, filters, allCandidates]);

  // Fetch blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setBlogsLoading(true);
        const response = await fetch('/api/blogs/latest?limit=6', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const data = await response.json();
        console.log('✅ Blogs loaded:', data.length);
        setBlogs(data);
      } catch (err) {
        console.error('❌ Error fetching blogs:', err);
        showErrorToast(err, 'Failed to load blogs.');
      } finally {
        setBlogsLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const data = await response.json();
        const uniqueTestimonials = [...new Map(data.map(testimonial => [testimonial.id, testimonial])).values()];
        setTestimonials(uniqueTestimonials);
      } catch (err) {
        console.error('Failed to load testimonials:', err);
      }
    };
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (testimonials.length > 0 && window.jQuery) {
      setTimeout(() => {
        const carousel = window.jQuery('.twm-testimonial-8-carousel');
        carousel.trigger('destroy.owl.carousel');
        carousel.owlCarousel({
          loop: false,
          rewind: true,
          nav: true,
          dots: false,
          margin: 30,
          autoplay: true,
          navText: ['<i class="feather-chevron-left"></i>', '<i class="feather-chevron-right"></i>'],
          responsive: { 0: { items: 1 }, 480: { items: 1 }, 991: { items: 2 } }
        });
      }, 100);
    }
  }, [testimonials]);

  // Mark page as ready
  useEffect(() => {
    if (!loading && !blogsLoading) setPageReady(true);
  }, [loading, blogsLoading]);

  // Init Swiper
  useEffect(() => {
    const initSwiper = () => {
      if (window.Swiper) {
        new window.Swiper('.v-notiinfoSwiper', {
          loop: true,
          pagination: { el: '.swiper-pagination', clickable: true },
          autoplay: { delay: 3000, disableOnInteraction: false },
        });
      }
    };
    setTimeout(initSwiper, 500);
  }, []);

  // Reinit blog carousel
  useEffect(() => {
    if (blogs.length > 0 && !blogsLoading && window.jQuery) {
      setTimeout(() => {
        window.jQuery('.twm-la-home-blog').owlCarousel('destroy');
        window.jQuery('.twm-la-home-blog').owlCarousel({
          loop: false, nav: true, dots: false, margin: 30, autoplay: false,
          navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
          responsive: { 0: { items: 1 }, 480: { items: 1 }, 991: { items: 2 }, 1199: { items: 3 } }
        });
      }, 100);
    }
  }, [blogs, blogsLoading]);

  useEffect(() => {
    if (window.jQuery?.fn?.owlCarousel) {
      setTimeout(() => {
        const carousel = window.jQuery('.twm-featured-city-carousal');
        if (!carousel.length) return;
        if (carousel.hasClass('owl-loaded')) carousel.trigger('destroy.owl.carousel');
        carousel.owlCarousel({
          loop: true,
          nav: false,
          dots: true,
          center: false,
          margin: 30,
          autoplay: true,
          navText: ['<i class="feather-chevron-left"></i>', '<i class="feather-chevron-right"></i>'],
          responsive: {
            0: { items: 1 },
            480: { items: 1 },
            575: { items: 2 },
            991: { items: 3 },
            1024: { items: 3 },
            1366: { items: 5 },
            1600: { items: 6 }
          }
        });
      }, 100);
    }
  }, []);


  const openCandidateModal = async (candidate) => {
    setSelectedCandidate(candidate);
    setDetailsLoading(true);
    try {
      const response = await fetch(`/api/candidates/${candidate.id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setCandidateDetails(data);
    } catch (err) {
      console.error('Error fetching candidate details:', err);
      showErrorToast(err, 'Failed to load candidate details.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeCandidateModal = () => {
    setSelectedCandidate(null);
    setCandidateDetails(null);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const data = {
        username: formData.get('username'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        subject: formData.get('subject'),
        message: formData.get('message')
      };
      const response = await fetch('/api/contact-us', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      e.target.reset();
      showSuccessToast('Thank you! Your message has been received. We will contact you soon.');
    } catch (err) {
      console.error('❌ Error submitting contact form:', err);
      showErrorToast(null, 'Failed to submit the form. Please try again.');
    }
  };

  // Tab click: reset everything
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setFilters({ jobCategory: '', preferredWorkCountry: '', skillLevel: '', religion: '', status: '' });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const hasActiveFilters = searchQuery.trim() || Object.values(filters).some(v => v);

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({ jobCategory: '', preferredWorkCountry: '', skillLevel: '', religion: '', status: '' });
    setActiveTab('all');
  };

  const handleCandidateSearchSubmit = (event) => {
    event.preventDefault();
    const query = new FormData(event.currentTarget).get("username")?.toString().trim();
    if (!query) return;
    setSearchQuery(query);
    setActiveTab('all');
    setFilters({ jobCategory: '', preferredWorkCountry: '', skillLevel: '', religion: '', status: '' });
    setTimeout(() => document.getElementById('candidates')?.scrollIntoView({ behavior: 'smooth' }), 0);
  };

  const handleHeroSearchSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const locationValue = heroLocation.trim();
    const preferredWorkCountry = filterOptions.preferredWorkCountries.find(country =>
      country.trim().toLowerCase() === locationValue.toLowerCase()
    ) || '';

    setFilters(currentFilters => ({
      ...currentFilters,
      jobCategory: formData.get('jobCategory') || '',
      religion: formData.get('religion') || '',
      preferredWorkCountry
    }));
    setSearchQuery(preferredWorkCountry ? '' : locationValue);
    setTimeout(() => document.getElementById('candidates')?.scrollIntoView({ behavior: 'smooth' }), 0);
  };

  const isArabic = currentLanguage === "ar";
  const isAmharic = currentLanguage === "am";
  const counterLabels = isAmharic ? {
    happyClient: "ደስተኛ ደንበኞች",
    completedCases: "የተጠናቀቁ የቅጥር ሂደቶች",
    successScore: "የስኬት መጠን",
    countries: "አገራት"
  } : isArabic ? {
    happyClient: "عميل سعيد",
    completedCases: "قضية مكتملة",
    successScore: "نسبة النجاح",
    countries: "دول"
  } : {
    happyClient: "Happy Client",
    completedCases: "Completed Cases",
    successScore: "Success Score",
    countries: "Countries"
  };
  const industriesCopy = isAmharic ? {
    title: "የምናገለግላቸው የሥራ ዘርፎች",
    description: "ከተራ የሥራ መደቦች እስከ ከፍተኛ አመራር ድረስ በተለያዩ የሥራ ዘርፎች ዘመናዊ የሰው ኃይል አቅርቦት እና አስተዳደር መፍትሔዎችን እንሰጣለን። በሰፊው እውቀታችን፣ መረባችን እና ልምዳችን ከተስማሚው የሥራ መደብ ጋር እንያይዝዎታለን።",
    readMore: "በዝርዝር ያንብቡ",
    cards: [
      "የቤት ውስጥ ረዳቶች እና የቤት አስተዳደር",
      "የሕፃናት እና የቤተሰብ እንክብካቤ",
      "የሙያ አበሰሎች (ሼፎች)",
      "ባለሙያ እና መካከለኛ ባለሙያ ሠራተኞች",
      "የጤና እንክብካቤ እና የአረጋውያን እንክብካቤ",
      "የንግድ አገልግሎቶች"
    ]
  } : isArabic ? {
    title: "القطاعات التي ندعمها",
    description: "نحن نقدم أحدث حلول التوظيف وإدارة القوى العاملة للوظائف التي تتراوح من المبتدئين إلى التنفيذيين عبر مختلف القطاعات. بفضل معرفتنا الواسعة وشبكتنا وخبرتنا، يمكننا ربطك بالدور الوظيفي المثالي.",
    readMore: "اقرأ المزيد",
    cards: [
      "المساعدات المنزليات وتدبير المنزلا",
      "رعاية الأطفال والتقديم الرعائيا",
      "محترفو الطهي والطهوة",
      "العمالة الماهرة وشبه الماهرة",
      "الرعاية الصحية ورعاية كبار السن",
      "الخدمات التجارية"
    ]
  } : {
    title: "Industries we support",
    description: "We provide cutting-edge recruitment and workforce management solutions for positions ranging from entry-level to executive across diverse industries. With our extensive knowledge, network, and expertise, we can match you with the ideal role.",
    readMore: "Read More",
    cards: [
      "Domestic Helpers & Housekeeping",
      "Childcare & Caregiving",
      "Culinary Professionals",
      "Skilled & Semi-Skilled Workers",
      "Healthcare & Elderly Care",
      "Commercial Services"
    ]
  };
  const networkCopy = isAmharic ? {
    separator: "የእኛ መረብ",
    title: "የሀገር ውስጥ ቢሮዎች፣ ዓለም አቀፍ ተደራሽነት",
    viewAll: "ሁሉንም የሥራ እንስቃሴዎች ይመልከቱ"
  } : isArabic ? {
    separator: "شبكتنا",
    title: "مكاتب محلية، وانتشار عالمي",
    viewAll: "عرض جميع الأعمال"
  } : {
    separator: "Our Network",
    title: "Local Offices, Global Reach",
    viewAll: "View All Portfolios"
  };
  const commitmentCopy = isAmharic ? {
    separator: "የእኛ ቃል ኪዳን",
    title: "ሊተመኑበት የሚችሉት ጥራት ያለው የሰው ኃይል መፍትሔ",
    description: "በኳታር፣ ዖማን፣ ሳዑዲ ዓረቢያ፣ ኩዌት፣ ዮርዳኖስ፣ የተባበሩት ዓረብ ኤምሬትስ፣ ባሕሬን እና ሊባኖስ ለሚገኙ አሠሪዎች ጥራት ያለው የሰው ኃይል በማቅረብ እንለያለን። አስተማማኝ እና ብቃት ያላቸው ሠራተኞች የእርስዎን ፍላጎት በትክክል እንዲያሟሉ በማድረግ ከአሲያ እና ከአፍሪካ ብቃት ያላቸውን ባለሙያዎች እንመርጣለን፣ እንመዝናለን፣ እንዲሁም እንመድባለን።",
    getStarted: "ይጀምሩ",
    jobAvailable: "አዳዲስ የሥራ እድሎች",
    newOpportunities: "ዛሬ የተጨመሩ አዳዲስ እድሎች"
  } : isArabic ? {
    separator: "التزامنا",
    title: "حلول توظيف عالية الجودة يمكنك الوثوق بها",
    description: "نحن متخصصون في تزويد أصحاب العمل بعمالة عالية الجودة في قطر، وعُمان، والسعودية، والكويت، والأردن، والإمارات، والبحرين، ولبنان. نحن نعمل على استقطاب وتدقيق وتسكين المهنيين الماهرين من جميع أنحاء آسيا وإفريقيا—مما يضمن توفير كوادر موثوقة ومؤهلة تلبي متطلباتك بدقة.",
    getStarted: "ابدأ الآن",
    jobAvailable: "وظائف جديدة متاحة",
    newOpportunities: "تمت إضافة فرص جديدة اليوم"
  } : {
    separator: "Our Commitment",
    title: "Quality Staffing Solutions You Can Trust",
    description: "We specialize in supplying quality manpower to employers across Qatar, Oman, Saudi Arabia, Kuwait, Jordan, UAE, Bahrain, and Lebanon. We source, vet, and place skilled professionals from across Asia and Africa—ensuring reliable, competent staff that meets your exact requirements.",
    getStarted: "Get Started",
    jobAvailable: "New Job Available",
    newOpportunities: "New opportunities added today"
  };
  const aboutCopy = isAmharic ? {
    separator: "ለምን ከእኛ ጋር ይሠራሉ",
    title: "ታማኝ የሰው ኃይል አቅራቢ",
    description: "በኳታር፣ ዖማን፣ ኬንያ እና ፊሊፒንስ በሚገኙ ቢሮዎቻችን True Touch ብቃት ያላቸውን እና መካከለኛ ባለሙያ ሠራተኞችን ለመቅጠር ታማኝ አጋርዎ ነው። ሙሉ የቅጥር፣ የምርጫ፣ የሰነድ እና የመደገፍ ሥራዎችን እንሰራለን—በዚህም ትክክለኛውን እጩ በፍጥነት ያገኛሉ።",
    hire: "አሁኑኑ ይቅጠሩ",
    solutions: "መፍትሔዎቻችንን ይመልከቱ"
  } : isArabic ? {
    separator: "لماذا تختار الشراكة معنا",
    title: "مزود مزود توظيف عمالة موثوق به",
    description: "بفضل فروعنا في قطر، وعُمان، وكينيا، والفلبين، تُعد \"ترو تاتش\" شريكك الموثوق لاستقدام العمالة الماهرة وشبه الماهرة. نحن نتولى كافة عمليات التوظيف والتقييم والتوثيق ودعم التسكين—لتتوصل إلى المرشح المثالي بسرعة.",
    hire: "وظّف الآن",
    solutions: "عرض حلولنا"
  } : {
    separator: "Why Partner With Us",
    title: "Trusted Manpower Recruitment Provider",
    description: "With offices in Qatar, Oman, Kenya, and the Philippines, True Touch is your trusted partner for hiring skilled and semi-skilled workers. We handle full recruitment, vetting, documentation, and placement support—so you get the perfect candidate quickly.",
    hire: "Hire Now",
    solutions: "View Our Solutions"
  };
  const heroCopy = isAmharic ? {
    partner: "በዓለም አቀፍ የሠራተኛ አቅርቦት ታማኝ አጋርዎ",
    hirePrefix: "በ True Touch ",
    skilled: "ብቃት ያላቸውን",
    hireSuffix: " ሠራተኞች ይቅጠሩ",
    description: "True Touch አሠሪዎችን ከአሲያ እና ከአፍሪካ ከተመረጡና ብቃት ካላቸው ባለሙያዎች ጋር ያገናኛል። በባህረ ሰላጤው አገራት፣ በመካከለኛው ምስራቅ እና ከዚያም ባሻገር ታማኝ የቤት ውስጥ ረዳቶችን፣ የጤና እንክብካቤ ሠራተኞችን፣ ሼፎችን እና ባለሙያ ሠራተኞችን እናቀርባለን።",
    professionLabel: "ሙያ",
    professionPlaceholder: "ሙያ ይምረጡ",
    religionLabel: "ሃይማኖት",
    religionPlaceholder: "ሃይማኖት ይምረጡ",
    locationLabel: "ቦታ",
    locationPlaceholder: "በቦታ ይፈልጉ...",
    search: "ፈልግ"
  } : isArabic ? {
    partner: "شريكك في التوظيف العالمي",
    hirePrefix: "توظيف عمال ",
    skilled: "ماهرين",
    hireSuffix: " مع ترو تاتش",
    description: "تربط \"ترو تاتش\" أصحاب العمل بمهنيين مؤهلين وماهرين من آسيا وإفريقيا. نحن نوفر العمالة المنزلية الموثوقة، ورعاة الصحة، والطهاة، والعمالة الماهرة في جميع أنحاء الخليج والشرق الأوسط وما بعده.",
    professionLabel: "المهنة",
    professionPlaceholder: "اختر المهنة",
    religionLabel: "الديانة",
    religionPlaceholder: "اختر الديانة",
    locationLabel: "الموقع",
    locationPlaceholder: "البحث حسب الموقع...",
    search: "بحث"
  } : {
    partner: "Your Partner in Global Recruitment",
    hirePrefix: "Hire ",
    skilled: "Skilled ",
    hireSuffix: " Workers with True Touch",
    description: "True Touch connects employers with vetted, skilled professionals from Asia and Africa. We provide reliable domestic helpers, healthcare workers, chefs, and skilled labor across the Gulf, Middle East, and beyond.",
    professionLabel: "What",
    professionPlaceholder: "Select Profession",
    religionLabel: "Religion",
    religionPlaceholder: "Select Religion",
    locationLabel: "Location",
    locationPlaceholder: "Search by location...",
    search: "Search"
  };
  const candidateSearchLabels = candidateSearchCopy[currentLanguage] || candidateSearchCopy.en;
  const homepageLabels = isAmharic ? {
    ourCandidates: "ዕጩዎቻችን",
    preScreenedTitle: "ለቅጥር ዝግጁ የሆኑ አስቀድመው የተገመገሙ ባለሙያዎች",
    allCandidates: "ሁሉም ዕጩዎች",
    byJobCategory: "በሥራ ዘርፍ",
    byCountry: "በሀገር",
    byAvailability: "በዝግጁነት",
    allJobCategories: "ሁሉም የሥራ ዘርፎች",
    allPreferredCountries: "ሁሉም ተመራጭ ሀገራት",
    allStatuses: "ሁሉም ሁኔታዎች",
    viewProfile: "ግለ-ታሪክን ይመልከቱ",
    whatsApp: "WhatsApp",
    clientTestimonials: "የደንበኞች ምስክርነት",
    whatOurPartnersSay: "አጋሮቻችን ስለ እኛ ምን ይላሉ?",
    industryResources: "የዘርፉ የመረጃ ምንጮች",
    insightsUpdates: "ለአሰሪዎች የሚሆኑ መረጃዎች እና ወቅታዊ ማሻሻያዎች",
    allBlogs: "ሁሉም ብሎጎች"
  } : isArabic ? {
    ourCandidates: "مرشحونا",
    preScreenedTitle: "خبراء تم تقييمهم مسبقاً ومتاحون للتوظيف",
    allCandidates: "جميع المرشحين",
    byJobCategory: "حسب الفئة الوظيفية",
    byCountry: "حسب الدولة",
    byAvailability: "حسب التوفر",
    allJobCategories: "جميع الفئات الوظيفية",
    allPreferredCountries: "جميع الدول المفضلة",
    allStatuses: "جميع الحالات",
    viewProfile: "عرض الملف الشخصي",
    whatsApp: "واتساب",
    clientTestimonials: "آراء العملاء",
    whatOurPartnersSay: "ماذا يقول شركاؤنا عنا",
    industryResources: "مصادر القطاع",
    insightsUpdates: "رؤى والتحديثات لأصحاب العمل",
    allBlogs: "جميع المقالات"
  } : {
    ourCandidates: "Our Candidates",
    preScreenedTitle: "Pre-Screened Professionals Available for Hiring",
    allCandidates: "All Candidates",
    byJobCategory: "By Job Category",
    byCountry: "By Country",
    byAvailability: "By Availability",
    allJobCategories: "All Job Categories",
    allPreferredCountries: "All Preferred Countries",
    allStatuses: "All Statuses",
    viewProfile: "View Profile",
    whatsApp: "WhatsApp",
    clientTestimonials: "Client Testimonials",
    whatOurPartnersSay: "What Our Partners Say About Us",
    industryResources: "Industry Resources",
    insightsUpdates: "Insights & Updates for Employers",
    allBlogs: "All Blogs"
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      {!pageReady && <Spinner fullPage={true} />}


      {/*Banner Start*/}
      <div className="twm-home-10-banner-section twm-bne-10-skew">
        <div ref={recruitmentMapRef} className="recruitment-route-map" aria-hidden="true" />
        <div className="container">
          <div className="row">
            {/*Left Section*/}
            <div className="col-xl-6 col-lg-6 col-md-12">
              <div className="twm-bnr-left-section">
                <div className="small-qb-box">
                  <span className="qb-1" />
                  <span className="qb-2 zoom-in-out-box" />
                  <span className="qb-3 zoom-in-out-box2" />
                  <span className="qb-4" />
                </div>
                <div className="twm-bnr-title-large-thin">Hire Skilled </div>
                <div className="twm-bnr-title-large-bold">Workers with True Touch</div>
                <div className="twm-bnr-search-bar">
                  <form onSubmit={handleCandidateSearchSubmit}>
                    <div className="row">
                      {/*Title*/}
                      <div className="form-group col-xl-8 col-lg-8 col-md-8">
                        <label>What</label>
                        <div className="twm-single-iput">
                          <input name="username" type="text" required className="form-control  bg-none" placeholder="Job title, Keywords, or company" />
                        </div>
                      </div>
                      {/*Find job btn*/}
                      <div className="form-group col-xl-4 col-lg-4 col-md-4">
                        <button type="submit" className="site-button">Find Job</button>
                      </div>
                    </div>
                  </form>
                </div>
                <div className="twm-bnr-popular-search">
                  <span className="twm-title">Your Partner in Global Recruitment</span>
                  <NavLink>True Touch connects employers with vetted, skilled professionals from Asia and Africa. We provide reliable domestic helpers, healthcare workers, chefs, and skilled labor across the Gulf, Middle East, and beyond.</NavLink> 
                </div>
              </div>
            </div>
            {/*right Section*/}
            <div className="col-xl-6 col-lg-6 col-md-12 twm-bnr-right-section">
              <div className="twm-bnr-right-content">
                <div className="bnr-media-wrap">
                  <div className="bnr-media">
                    <img src="/assets/images/home-10/banner-bg/right-pic1.png" alt="TrueTouch professionals" loading="lazy" decoding="async" />
                  </div>
                  <div className="semi-circle rotate-center-2" />
                </div>
              </div>
            </div>
          </div>
          <div className="twm-bnr-bottom-section">
            <div className="twm-browse-jobs">TrueTouch</div>
          </div>
        </div>
      </div>
      {/*Banner End*/}

      {/* ABOUT SECTION START */}
      <div id="get-jobs" dir={isArabic ? "rtl" : "ltr"} className={`section-full p-t120 p-b0 site-bg-white twm-millions-1-area pos-relative ${isArabic ? "about-content-rtl" : ""}`}>
        <div className="container">
          <div className="twm-millions-section-wrap">
            <div className="row">
              <div className="col-lg-7 col-md-12">
                <div className="twm-millions-1-section">
                  <div className="twm-media">
                    <JobZImage src="images/home-5/millions-jobs/main-pic.png" alt="" />
                    <div className="twm-circle-jobs-wrap">
                      <div className="twm-circle-jobs-box one bounce2">
                        <div className="twm-circle-job-pics"><JobZImage src="images/home-7/flag-icon/qatar.png" alt="#" /></div>
                      </div>
                      <div className="twm-circle-jobs-box two bounce">
                        <div className="twm-circle-job-pics"><JobZImage src="images/home-7/flag-icon/saudi-arabia.png" alt="#" /></div>
                      </div>
                      <div className="twm-circle-jobs-box three bounce2">
                        <div className="twm-circle-job-pics"><JobZImage src="images/home-7/flag-icon/jordan.png" alt="#" /></div>
                      </div>
                      <div className="twm-circle-jobs-box four bounce">
                        <div className="twm-circle-job-pics"><JobZImage src="images/home-7/flag-icon/united-arab-emirates.png" alt="#" /></div>
                      </div>
                      <div className="twm-circle-jobs-box five bounce2">
                        <div className="twm-circle-job-pics"><JobZImage src="images/home-7/flag-icon/qatar.png" alt="#" /></div>
                      </div>
                      <div className="twm-circle-jobs-box six bounce">
                        <div className="twm-circle-job-pics"><JobZImage src="images/home-7/flag-icon/saudi-arabia.png" alt="#" /></div>
                      </div>
                    </div>
                  </div>
                  <div className="twm-bg-circle-pic">
                    <JobZImage src="images/home-5/millions-jobs/bg-circle.png" alt="#" />
                  </div>
                </div>
              </div>
              <div className="col-lg-5 col-md-12">
                <div className="twm-millions-1-section-right">
                  <div className="section-head left wt-small-separator-outer">
                    <div className="wt-small-separator site-text-primary"><div>{aboutCopy.separator}</div></div>
                    <h2 className="wt-title">{aboutCopy.title}</h2>
                    <p>{aboutCopy.description}</p>
                  </div>
                  <div className="twm-read-more cplumn-2">
                    <a href="#contact-us" className="site-button" onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('contact-us')?.scrollIntoView({ behavior: 'smooth' });
                    }}>{aboutCopy.hire}</a>
                    <a href="#contact-us" className="site-button-link underline" onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('contact-us')?.scrollIntoView({ behavior: 'smooth' });
                    }}>{aboutCopy.solutions}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="twm-bg-shape5" />
      </div>
      {/* ABOUT SECTION END */}

                  {/* Counter SECTION START */}
            <div className="section-full p-t0 p-b0 site-bg-white twm-counter-page-5-wrap">
                <div className="container">
                    <div className="twm-company-approch5-outer">
                        <div className="twm-company-approch5">
                            <div className={`row ${isArabic ? "stats-counter-rtl" : ""}`}>
                                {/*block 1*/}
                                <div className="col-lg-3 col-md-6 col-sm-6">
                                    <div className="counter-outer-two">
                                        <div className="icon-content">
                                            <div className="tw-count-number site-text-white">
                                                <span className="counter">
<CountUp end={28} duration={10} />
</span>+</div>
                                            <p className="icon-content-info">{counterLabels.happyClient}
</p>
                                        </div>
                                    </div>
                                </div>
                                {/*block 2*/}
                                <div className="col-lg-3 col-md-6 col-sm-6">
                                    <div className="counter-outer-two">
                                        <div className="icon-content">
                                            <div className="tw-count-number site-text-white">
                                                <span className="counter">
<CountUp end={25} duration={10} />
</span>k+</div>
                                            <p className="icon-content-info">{counterLabels.completedCases}
</p>
                                        </div>
                                    </div>
                                </div>
                                {/*block 3*/}
                                <div className="col-lg-3 col-md-6 col-sm-6">
                                    <div className="counter-outer-two">
                                        <div className="icon-content">
                                            <div className="tw-count-number site-text-white">
                                                <span className="counter">80</span>%</div>
                                            <p className="icon-content-info">{counterLabels.successScore}
</p>
                                        </div>
                                    </div>
                                </div>
                                {/*block 4*/}
                                <div className="col-lg-3 col-md-6 col-sm-6">
                                    <div className="counter-outer-two">
                                        <div className="icon-content">
                                            <div className="tw-count-number site-text-white">
                                                <span className="counter">
<CountUp end={10} duration={10} />
</span>+</div>
                                            <p className="icon-content-info">{counterLabels.countries}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Counter SECTION END */}

      {/* FEATURED JOBS SECTION START */}
      <div dir={isArabic ? "rtl" : "ltr"} className={`section-full p-t120 p-t180 pos-relative site-bg-white twm-featured-city-area ${isArabic ? "industries-section-rtl" : ""}`}>
        <div className="twm-bg-section-box" />
        <div className="container">
          <div className="wt-separator-two-part content-white">
            <div className="row wt-separator-two-part-row">
              <div className="col-xl-12 col-lg-12 col-md-12 wt-separator-two-part-left">
                <div className="section-head left wt-small-separator-outer">
                  <h2 className="wt-title">{industriesCopy.title}</h2>
                  <div className="wt-small-separator site-text-primary"><div>{industriesCopy.description}</div></div>
                </div>
              </div>
            </div>
          </div>
          <div className="twm-featured-city2-section industries-cards-section">
            <div className="row">
              <div className="col-xl-4 col-lg-4 col-md-6">
                <div className="twm-featured-city2">
                  <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/jobs-categories/ResidentialCleanerHousekeeper.jpg")})` }} />
                  <div className="twm-city-info">
                    <h4 className="twm-title"><NavLink to={publicUser.HOME1}>{industriesCopy.cards[0]}</NavLink></h4>
                    <div className="wt-post-readmore">
                      <a href="blog-single.html" className="site-button-link site-text-primary">{industriesCopy.readMore}</a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-lg-4 col-md-6">
                <div className="twm-featured-city2">
                  <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/jobs-categories/NannyChildcareSpecialist.jpg")})` }} />
                  <div className="twm-city-info">
                    <h4 className="twm-title"><NavLink to={publicUser.HOME1}>{industriesCopy.cards[1]}</NavLink></h4>
                    <div className="wt-post-readmore">
                      <a href="blog-single.html" className="site-button-link site-text-primary">{industriesCopy.readMore}</a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-5 col-lg-4 col-md-6">
                <div className="twm-featured-city2">
                  <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/jobs-categories/PrivateChefCook.jpg")})` }} />
                  <div className="twm-city-info">
                    <h4 className="twm-title"><NavLink to={publicUser.HOME1}>{industriesCopy.cards[2]}</NavLink></h4>
                    <div className="wt-post-readmore">
                      <a href="blog-single.html" className="site-button-link site-text-primary">{industriesCopy.readMore}</a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-4 col-lg-4 col-md-6">
                <div className="twm-featured-city2">
                  <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/jobs-categories/Logistics&WarehousingSupervisor.jpg")})` }} />
                  <div className="twm-city-info">
                    <h4 className="twm-title"><NavLink to={publicUser.HOME1}>{industriesCopy.cards[3]}</NavLink></h4>
                    <div className="wt-post-readmore">
                      <a href="blog-single.html" className="site-button-link site-text-primary">{industriesCopy.readMore}</a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-5 col-lg-4 col-md-6">
                <div className="twm-featured-city2">
                  <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/jobs-categories/ElderlyCareCaregiver.jpg")})` }} />
                  <div className="twm-city-info">
                    <h4 className="twm-title"><NavLink to={publicUser.HOME1}>{industriesCopy.cards[4]}</NavLink></h4>
                    <div className="wt-post-readmore">
                      <a href="blog-single.html" className="site-button-link site-text-primary">{industriesCopy.readMore}</a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-lg-4 col-md-6">
                <div className="twm-featured-city2">
                  <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/jobs-categories/KitchenCleanerCommercialCleaning.jpg")})` }} />
                  <div className="twm-city-info">
                    <h4 className="twm-title"><NavLink to={publicUser.HOME1}>{industriesCopy.cards[5]}</NavLink></h4>
                    <div className="wt-post-readmore">
                      <a href="blog-single.html" className="site-button-link site-text-primary">{industriesCopy.readMore}</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* FEATURED SECTION END */}

      {/* OUR SERVICES SECTION START */}
      <div dir={isArabic ? "rtl" : "ltr"} className={`section-full p-t120 p-b90 site-bg-light twm-how-t-get-wrap7 ${isArabic ? "commitment-section-rtl" : ""}`}>
        <div className="container">
          <div className="twm-how-t-get-section">
            <div className="row g-5 gy-5 align-items-center">
              <div className="col-xl-5 col-lg-5 col-md-12">
                <div className="twm-how-t-get-section-left">
                  <div className="section-head left wt-small-separator-outer">
                    <div className="wt-small-separator site-text-primary"><div>{commitmentCopy.separator}</div></div>
                    <h2 className="wt-title">{commitmentCopy.title}</h2>
                    <p>{commitmentCopy.description}</p>
                  </div>
                  <div className="twm-how-t-get-bottom">
                    <NavLink to={publicUser.HOME1} className="site-button">{commitmentCopy.getStarted}</NavLink>
                    <div className="twm-left-icon-bx">
                      <div className="twm-left-icon-media site-bg-primary">
                        <i className="flaticon-bell site-text-white" />
                      </div>
                      <div className="twm-left-icon-content">
                        <h4 className="icon-title">{commitmentCopy.jobAvailable}</h4>
                          <p>{commitmentCopy.newOpportunities}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-7 col-lg-7 col-md-12">
                <div className="twm-how-t-get-section-right">
                  <div className="twm-media">
                    <JobZImage src="images/gallery/7.jpeg" alt="#" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* OUR SERVICES SECTION END */}

      {/* Portfolio SECTION START */}
<div id="portfolio" dir={isArabic ? "rtl" : "ltr"} className={`section-full p-t120 p-b90 site-bg-white twm-featured-city-carousal-area ${isArabic ? "network-section-rtl" : ""}`}>
  <div className="container">
    <div className="wt-separator-two-part">
      <div className="row wt-separator-two-part-row">
        <div className="col-xl-5 col-lg-5 col-md-12 wt-separator-two-part-left">
          <div className="section-head left wt-small-separator-outer">
            <div className="wt-small-separator site-text-primary"><div>{networkCopy.separator}</div></div>
            <h2 className="wt-title">{networkCopy.title}</h2>
          </div>
        </div>
        <div className="col-xl-7 col-lg-7 col-md-12 wt-separator-two-part-right text-right">
          <NavLink to={publicUser.HOME1} className="site-button">{networkCopy.viewAll}</NavLink>
        </div>
      </div>
    </div>
  </div>
  <GalleryLightbox images={[
    publicUrlFor("images/gallery/1.jpg"),
    publicUrlFor("images/gallery/2.jpg"),
    publicUrlFor("images/gallery/3.jpg"),
    publicUrlFor("images/gallery/4.jpg"),
    publicUrlFor("images/gallery/5.jpg")
  ]}>
    {(openLightbox) => {
      // Delegated click handler — survives owl-carousel's cloneNode() duplicates,
      // which copy data-* attributes but NOT React's synthetic onClick.
      useEffect(() => {
        const handleClick = (event) => {
          const item = event.target.closest('.twm-featured-city-carousal .item');
          if (item && item.dataset.galleryIndex !== undefined) {
            openLightbox(Number(item.dataset.galleryIndex));
          }
        };
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
      }, [openLightbox]);

      return (
        <div dir="ltr" className="twm-featured-city-carousal-wrap">
          <div className="owl-carousel twm-featured-city-carousal">
            {[1, 2, 3, 4, 5].map((n, i) => (
              <div key={n} className="item" data-gallery-index={i}>
                <div className="twm-featured-city2 portfolio-card-wrapper">
                  <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor(`images/gallery/${n}.jpg`)})` }} />
                  <div className="portfolio-card-overlay">
                    <div className="portfolio-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }}
  </GalleryLightbox>
</div>
{/* Portfolio SECTION END */}

      {/* CANDIDATES START */}
      <div id="candidates" className="section-full p-t120 p-b90 site-bg-white twm-candidate-h-page7-wrap pos-relative">
        <div className="container">
          <div className="section-head center wt-small-separator-outer">
            <div className="wt-small-separator site-text-primary"><div>{homepageLabels.ourCandidates}</div></div>
            <h2 className="wt-title">{homepageLabels.preScreenedTitle}</h2>
          </div>
        </div>

        <div className="container-fluid">
          <div className="section-content">
            <div className="twm-candidate-h-page7">
              {loading && <Spinner />}
              {!loading && (
                <>
                  {/* ── SEARCH, TABS & FILTER UI ── */}
                  <div className="twm-candidate-filter-section" style={{ marginBottom: '40px' }}>

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
                      {[
                        { key: 'all',          label: homepageLabels.allCandidates },
                        { key: 'category',     label: homepageLabels.byJobCategory },
                        { key: 'country',      label: homepageLabels.byCountry },
                        { key: 'availability', label: homepageLabels.byAvailability },
                      ].map(tab => (
                        <button
                          key={tab.key}
                          onClick={() => handleTabClick(tab.key)}
                          style={{
                            padding: '10px 22px',
                            borderRadius: '22px',
                            border: '2px solid',
                            borderColor: activeTab === tab.key ? 'var(--site-primary, #A9C731)' : '#e0e0e0',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '14px',
                            backgroundColor: activeTab === tab.key ? 'var(--site-primary, #A9C731)' : 'white',
                            color: activeTab === tab.key ? 'white' : '#555',
                            transition: 'all 0.25s ease'
                          }}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Search Input */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                      <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
                        <i className="feather-search" style={{
                          position: 'absolute', left: '16px', top: '50%',
                          transform: 'translateY(-50%)', color: '#aaa', fontSize: '15px'
                        }} />
                        <input
                          type="text"
                          placeholder={candidateSearchLabels.searchPlaceholder}
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '12px 20px 12px 42px',
                            borderRadius: '26px',
                            border: '1px solid #ddd',
                            fontSize: '14px',
                            outline: 'none',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            transition: 'border-color 0.2s'
                          }}
                          onFocus={e => e.target.style.borderColor = 'var(--site-primary, #A9C731)'}
                          onBlur={e => e.target.style.borderColor = '#ddd'}
                        />
                      </div>
                    </div>

                    {/* Filter Dropdowns */}
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>

                      {/* Job Category — shown on tabs: all, category */}
                      {(activeTab === 'all' || activeTab === 'category') && (
                        <select
                          value={filters.jobCategory}
                          onChange={e => handleFilterChange('jobCategory', e.target.value)}
                          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', backgroundColor: 'white', width: '160px', cursor: 'pointer' }}
                        >
                          <option value="">{homepageLabels.allJobCategories}</option>
                          {Array.from(new Set(filterOptions.professions)).map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      )}

                      {/* Preferred work country — shown on tabs: all, country */}
                      {(activeTab === 'all' || activeTab === 'country') && (
                        <select
                          value={filters.preferredWorkCountry}
                          onChange={e => handleFilterChange('preferredWorkCountry', e.target.value)}
                          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', backgroundColor: 'white', width: '160px', cursor: 'pointer' }}
                        >
                          <option value="">{homepageLabels.allPreferredCountries}</option>
                          {Array.from(new Set(filterOptions.preferredWorkCountries)).map(country => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </select>
                      )}

                      {/* Skill Level — shown on tab: all only */}
                      {activeTab === 'all' && (
                        <select
                          value={filters.skillLevel}
                          onChange={e => handleFilterChange('skillLevel', e.target.value)}
                          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', backgroundColor: 'white', width: '160px', cursor: 'pointer' }}
                        >
                          <option value="">All Skill Levels</option>
                          {Array.from(new Set(filterOptions.skillLevels)).map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      )}

                      {/* Status — shown on tabs: all, availability — values from DB (normalized lowercase) */}
                      {(activeTab === 'all' || activeTab === 'availability') && (
                        <select
                          value={filters.status}
                          onChange={e => handleFilterChange('status', e.target.value)}
                          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', backgroundColor: 'white', width: '160px', cursor: 'pointer' }}
                        >
                          <option value="">{homepageLabels.allStatuses}</option>
                          {filterOptions.statuses.length > 0
                            ? Array.from(new Set(filterOptions.statuses)).map(s => (
                                <option key={s} value={s}>
                                  {s.charAt(0).toUpperCase() + s.slice(1)}
                                </option>
                              ))
                            : (
                              <>
                                <option value="available">Available</option>
                                <option value="hired">Hired</option>
                                <option value="pending">Pending</option>
                              </>
                            )
                          }
                        </select>
                      )}

                      {/* Clear Filters */}
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          style={{
                            padding: '10px 16px', borderRadius: '8px', border: 'none',
                            fontSize: '14px', backgroundColor: '#ff4444', color: 'white',
                            cursor: 'pointer', fontWeight: '500', display: 'flex',
                            alignItems: 'center', gap: '6px'
                          }}
                        >
                          ✕ Clear Filters
                        </button>
                      )}
                    </div>

                    {/* Results Count */}
                    <div style={{ textAlign: 'center', color: '#999', fontSize: '13px', marginBottom: '24px' }}>
                      {candidateSearchLabels.showingCount
                        .replace('0', filteredCandidates.length)
                        .replace('0', allCandidates.length)}
                    </div>
                  </div>
                  {/* ── END FILTER UI ── */}

                  <div className="row d-flex justify-content-center m-b30">
                    {filteredCandidates.length > 0 ? (
                      filteredCandidates.slice(0, 8).map(candidate => (
                        <div key={candidate.id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                          <div className="twm-candidates-grid-h-page7 m-b30">
                            <div className="twm-top-section-content">
                              <div className="twm-media">
                                <div className="twm-media-pic">
                                  <JobZImage
                                    src={candidate.profile_picture ? (getCandidateProfilePictureUrl(candidate.profile_picture) || candidateProfileFallback) : candidateProfileFallback}
                                    onError={(event) => {
                                      event.currentTarget.onerror = null;
                                      event.currentTarget.src = candidateProfileFallback;
                                    }}
                                    alt={candidate.full_name}
                                  />
                                </div>
                              </div>
                              <div className="twm-mid-content">
                                <div className="twm-candidates-tag">
                                  <span className={candidate.status?.toLowerCase()}>{candidate.status}</span>
                                </div>
                                <button onClick={() => openCandidateModal(candidate)} className="twm-job-title" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                  <h4>{candidate.full_name}</h4>
                                </button>
                                <p>{candidate.profession}</p>
                              </div>
                            </div>
                            <div className="twm-fot-content">
                              <div className="twm-left-info">
                                <p className="twm-candidate-address">
                                  <i className="feather-map-pin" />{candidate.location || "N/A"}
                                </p>
                                <div className="twm-jobs-vacancies">{candidate.hourly_rate}</div>
                              </div>
                              <div className="twm-action-buttons" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                <button onClick={() => openCandidateModal(candidate)} className="btn-view-profile" style={{ flex: 1, textAlign: 'center', padding: '8px 12px', fontSize: '14px', cursor: 'pointer' }}>
                                  {homepageLabels.viewProfile}
                                </button>
                                <a
                                  href={buildWhatsAppLink(candidate)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn-whatsapp-action"
                                  style={{ flex: 1, textAlign: 'center', padding: '8px 12px', fontSize: '14px' }}
                                >
                                  {homepageLabels.whatsApp}
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-12 text-center" style={{ padding: '40px 0' }}>
                        <p style={{ color: '#999', fontSize: '15px' }}>
                          {hasActiveFilters ? 'No candidates match your search or filters.' : candidateSearchLabels.noCandidatesAvailable}
                        </p>
                        {hasActiveFilters && (
                          <button onClick={clearFilters} className="site-button" style={{ marginTop: '12px' }}>
                            Clear Filters
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-center m-b30">
                    <NavLink to={publicUser.candidate.GRID} className="site-button">{homepageLabels.allCandidates}</NavLink>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="twm-bg-candi-pattern" />

        {/* TESTIMONIAL SECTION START */}
            <div className="section-full p-t120 p-b90 site-bg-light twm-testimonial-8-area">
                <div className="container">
                    {/* title="" START*/}
                    <div className="section-head left wt-small-separator-outer">
                        <div className="section-head center wt-small-separator-outer">
                            <div className="wt-small-separator site-text-primary">
                                <div>{homepageLabels.clientTestimonials}</div>
                            </div>
                            <h2 className="wt-title">{homepageLabels.whatOurPartnersSay}</h2>
                        </div>
                    </div>
                    {/* title="" END*/}
                    <div className="section-content">
                        <div className="owl-carousel twm-testimonial-8-carousel m-b30 owl-btn-bottom-center ">
                            {testimonials.map((testimonial) => (
                                <div className="item" key={testimonial.id}>
                                    <div className="testimonials-v site-bg-white">
                                        <div className="twm-testi-media">
                                            <img
                                                src={testimonial.avatar_image ? getTestimonialAvatarUrl(testimonial.avatar_image) : publicUrlFor("images/testimonial-placeholder.svg")}
                                                alt={`${testimonial.company_name} testimonial`}
                                                loading="lazy"
                                                decoding="async"
                                                onError={(event) => {
                                                  event.currentTarget.onerror = null;
                                                  event.currentTarget.src = publicUrlFor("images/testimonial-placeholder.svg");
                                                }}
                                            />
                                        </div>
                                        <div className="testimonial-v-content">
                                            <div className="t-testimonial-top">
                                                <div className="t-quote"><i className="fa fa-quote-left" /></div>
                                                <div className="t-rating">
                                                    {Array.from({ length: 5 }, (_, index) => (
                                                        <span key={index} className={index < Number(testimonial.rating) ? "star-filled" : "star-empty"}><i className="fa fa-star" /></span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="t-discription">{testimonial.testimonial_text}</div>
                                            <div className="twm-testi-detail">
                                                <div className="twm-testi-name">{testimonial.company_name}</div>
                                                <div className="twm-testi-position">{testimonial.designation}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {/* TESTIMONIAL SECTION END */}


              {/* OUR BLOG START */}
      <div id="our-blogs" className={`section-full p-t120 p-b90 site-bg-gray${isArabic ? " blog-section-rtl" : ""}`}>
        <div className="container">
          <div className="section-head center wt-small-separator-outer">
            <div className="wt-small-separator site-text-primary"><div>{homepageLabels.industryResources}</div></div>
            <h2 className="wt-title">{homepageLabels.insightsUpdates}</h2>
          </div>
          <div className="section-content">
            {blogsLoading ? (
              <Spinner />
            ) : blogs.length > 0 ? (
              <>
                <div className="twm-blog-responsive-grid">
                  {blogs.slice(0, 6).map(blog => (
                    <div key={blog.id} className="twm-blog-responsive-item">
                      <div className="blog-post twm-blog-post-1-outer">
                        <div className="wt-post-media">
                          <NavLink to={`/blog-detail/${blog.id}`}>
                            <JobZImage
                              src={blog.image_url ? getJobImageUrl(blog.image_url) : "https://cdn.builder.io/api/v1/image/assets%2F5e5700cc98ef413c911c8b7a4a98ea76%2F3483d0d2e206411c8f937b411ad53cfd?format=webp&width=800&height=1200"}
                              onError={(event) => {
                                event.currentTarget.onerror = null;
                                event.currentTarget.src = "https://cdn.builder.io/api/v1/image/assets%2F5e5700cc98ef413c911c8b7a4a98ea76%2F3483d0d2e206411c8f937b411ad53cfd?format=webp&width=800&height=1200";
                              }}
                              alt={blog.title}
                            />
                          </NavLink>
                        </div>
                        <div className="wt-post-info blog-card-content">
                          <div className="wt-post-meta">
                            <ul>
                              <li className="post-date blog-card-date-ltr">
                                {new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' })}
                              </li>
                              <li className="post-author">By {blog.author}</li>
                            </ul>
                          </div>
                          <div className="wt-post-title">
                            <h4 className="post-title">
                              <NavLink to={`/blog-detail/${blog.id}`}>{blog.title}</NavLink>
                            </h4>
                          </div>
                          <div className="wt-post-text">
                            <p>{truncateText(blog.description)}</p>
                          </div>
                          <div className="wt-post-readmore">
                            <NavLink to={`/blog-detail/${blog.id}`} className="site-button-link site-text-primary">Read More</NavLink>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center" style={{ marginTop: '40px' }}>
                  <NavLink to="/blogs" className="site-button">{homepageLabels.allBlogs}</NavLink>
                </div>
              </>
            ) : (
              <div className="text-center p-5"><p>No blogs available</p></div>
            )}
          </div>
        </div>
      </div>
        {/* OUR BLOG END */}

      
        <div className={`container regional-offices-section${isArabic ? ' regional-offices-section-rtl' : ''}`} dir={isArabic ? 'rtl' : 'ltr'}>
          <div className="twm-j-ofr-wrap">
            <div className="twm-j-ofr-content regional-offices-background">
              <div className="row align-items-center regional-offices-row">
                <div className="col-lg-5 col-md-12 regional-offices-details">
                  <div className="twm-j-ofr-map-content">
                    <div className="section-head left wt-small-separator-outer regional-offices-heading">
                      <h2 className="wt-title">
                        {isAmharic ? <><span className="site-text-primary">ክልላዊ ቢሮዎቻችን</span></> : isArabic ? <><span className="site-text-primary">مكاتبنا الإقليمية</span></> : <>Our <span className="site-text-primary">Regional Offices</span></>}
                      </h2>
                    </div>
                    <div className="regional-offices-list">
                      <div className="regional-office-item">
                        <i className="fas fa-map-marker-alt site-text-primary regional-office-icon" />
                        <div>
                          <h4 className="regional-office-label">{isAmharic ? 'ዋናው ቦታ' : isArabic ? 'الموقع الرئيسي' : 'Primary Location'}</h4>
                          <p className="regional-office-value">{isAmharic ? 'አዲስ አበባ፣ ኢትዮጵያ' : isArabic ? 'أديس أبابا، إثيوبيا' : 'Addis Ababa, Ethiopia'}</p>
                        </div>
                      </div>
                      <div className="regional-office-item">
                        <i className="fas fa-globe site-text-primary regional-office-icon" />
                        <div>
                          <h4 className="regional-office-label">{isAmharic ? 'ክልላዊ ቢሮዎች' : isArabic ? 'المكاتب الإقليمية' : 'Regional Offices'}</h4>
                          <p className="regional-office-value">{isAmharic ? 'ኳታር፣ ዖማን፣ ኬንያ፣ ፊሊፒንስ' : isArabic ? 'قطر، عُمان، كينيا، الفلبين' : 'Qatar, Oman, Kenya, Philippines'}</p>
                        </div>
                      </div>
                      <div className="regional-office-item">
                        <i className="fas fa-phone site-text-primary regional-office-icon" />
                        <div>
                          <h4 className="regional-office-label">{isAmharic ? 'ስልክ' : isArabic ? 'التواصل' : 'Contact'}</h4>
                          <p className="regional-office-value regional-office-ltr-value">+251 91 120 8322</p>
                        </div>
                      </div>
                      <div className="regional-office-item">
                        <i className="fas fa-envelope site-text-primary regional-office-icon" />
                        <div>
                          <h4 className="regional-office-label">{isAmharic ? 'ኢሜይል' : isArabic ? 'البريد الإلكتروني' : 'Email'}</h4>
                          <p className="regional-office-value regional-office-ltr-value">truetouch@truetouchaddis.com</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-7 col-md-12 regional-offices-map-column">
                  <div className="regional-offices-map">
                    <iframe
                      title={isAmharic ? 'የ True Touch ቢሮ' : isArabic ? 'مكتب ترو تاتش' : 'TrueTouch Office'}
                      width="100%"
                      height="380"
                      loading="lazy"
                      src="https://maps.google.com/maps?q=9.011711495201522,38.75411823390739&z=16&output=embed"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* CANDIDATES END */}



      {/* CONTACT US SECTION START */}
      <div id="contact-us" className="section-full twm-contact-one">
        <div className="section-content">
          <div className="container">
            <div className={`contact-one-inner${isArabic ? ' contact-one-inner-rtl' : ''}`}>
              <div className="row">
                <div className="col-lg-6 col-md-12">
                  <div className="contact-form-outer">
                    <div className="section-head left wt-small-separator-outer">
                      <h2 className="wt-title">{isAmharic ? 'የሰው ኃይል ይጠይቁ' : isArabic ? 'اطلب القوى العاملة لديك' : 'Request Your Workforce'}</h2>
                      <p>{isAmharic ? 'የሰው ኃይል ፍላጎትዎን ይንገሩን እና ከተስማሚዎቹ ባለሙያዎች ጋር እንያይዝዎታለን። በ 24 ሰዓታት ውስጥ ምላሽ እንሰጥዎታለን።' : isArabic ? 'أخبرنا باحتياجاتك من العمالة وسنقوم بربطك بالمهنيين المناسبين. سنتواصل معك خلال 24 ساعة.' : "Tell us about your staffing needs and we'll match you with the right professionals. We'll get back to you within 24 hours."}</p>
                    </div>
                    <form className="cons-contact-form" onSubmit={handleContactSubmit}>
                      <div className="row">
                        <div className="col-lg-6 col-md-6">
                          <div className="form-group mb-3">
                            <input name="username" type="text" required className="form-control" placeholder={isAmharic ? 'ስም' : isArabic ? 'الاسم' : 'Name'} />
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-6">
                          <div className="form-group mb-3">
                            <input name="email" type="email" required className="form-control" placeholder={isAmharic ? 'ኢሜይል' : isArabic ? 'البريد الإلكتروني' : 'Email'} />
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-6">
                          <div className="form-group mb-3">
                            <input name="phone" type="text" required className="form-control" placeholder={isAmharic ? 'ስልክ ቁጥር' : isArabic ? 'رقم الهاتف' : 'Phone'} />
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-6">
                          <div className="form-group mb-3">
                            <input name="subject" type="text" required className="form-control" placeholder={isAmharic ? 'ርዕስ' : isArabic ? 'الموضوع' : 'Subject'} />
                          </div>
                        </div>
                        <div className="col-lg-12">
                          <div className="form-group mb-3">
                            <textarea name="message" className="form-control" rows={3} placeholder={isAmharic ? 'መልእክት' : isArabic ? 'الرسالة' : 'Message'} defaultValue={""} />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <button type="submit" className="site-button">{isAmharic ? 'አሁኑኑ ይላኩ' : isArabic ? 'إرسال الآن' : 'Submit Now'}</button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
                <div className="col-lg-6 col-md-12">
                  <div className="contact-info-wrap">
                    <div className="contact-info">
                      <h3 className="twm-title advantages-heading">{isAmharic ? 'ከ True Touch ጋር የሚያገኟቸው ጥቅሞች' : isArabic ? 'مزاياك مع ترو تاتش' : 'Your advantages with True Touch'}</h3>
                      <div className="contact-info-section">
                        <div className="c-info-column">
                          <div className="c-info-icon"><i className="fas fa-globe-africa" /></div>
                          <h3 className="twm-title">{isAmharic ? 'አገራት' : isArabic ? 'الدول' : 'Countries'}</h3>
                          <p>{isAmharic ? '62 አገራት' : isArabic ? '62 دولة' : '62 Countries'}</p>
                        </div>
                        <div className="c-info-column">
                          <div className="c-info-icon"><i className="fas fa-user-tie" /></div>
                          <h3 className="twm-title">{isAmharic ? 'ደንበኞች' : isArabic ? 'العملاء' : 'Clients'}</h3>
                          <p>{isAmharic ? 'በሺዎች የሚቆጠሩ ደንበኞች' : isArabic ? 'الآلاف من العملاء' : '1000s of Clients'}</p>
                        </div>
                        <div className="c-info-column">
                          <div className="c-info-icon"><i className="fas fa-map-marked-alt" /></div>
                          <h3 className="twm-title">{isAmharic ? 'ቦታዎች' : isArabic ? 'المواقع' : 'Locations'}</h3>
                          <p>{isAmharic ? '3,800 ቦታዎች' : isArabic ? '3,800 موقع' : '3,800 Locations'}</p>
                        </div>
                        <div className="c-info-column">
                          <div className="c-info-icon"><i className="fas fa-users" /></div>
                          <h3 className="twm-title">{isAmharic ? 'ሠራተኞች' : isArabic ? 'العمالة' : 'Workers'}</h3>
                          <p>{isAmharic ? '660,000 በሥራ ላይ ያሉ ሰዎች' : isArabic ? '660,000 شخص في مهام عمل' : '660,000 People on assignment'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* CONTACT US SECTION END */}

      {/* CANDIDATE CV MODAL */}
      {selectedCandidate && (
        <div className="cv-modal-overlay" onClick={closeCandidateModal}>
          <div className="cv-modal" onClick={e => e.stopPropagation()}>
            <div className="cv-modal-header">
              <h2 className="cv-modal-title">Professional CV</h2>
              <button onClick={closeCandidateModal} className="cv-close-btn">×</button>
            </div>

            {detailsLoading ? (
              <div className="cv-loading-state"><p>Loading candidate profile...</p></div>
            ) : candidateDetails ? (
              <div className="cv-modal-content">
                <div className="cv-header-section">
                  <div className="cv-photo-container">
                    <JobZImage
                      src={
                        (candidateDetails.profile_picture ? getCandidateProfilePictureUrl(candidateDetails.profile_picture) : null) ||
                        (selectedCandidate.profile_picture ? getCandidateProfilePictureUrl(selectedCandidate.profile_picture) : null) ||
                        candidateProfileFallback
                      }
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = candidateProfileFallback;
                      }}
                      alt={candidateDetails.name}
                      className="cv-profile-photo"
                    />
                  </div>
                  <div className="cv-header-info">
                    <h1 className="cv-candidate-name">{candidateDetails.name}</h1>
                    <p className="cv-job-title">{candidateDetails.occupation}</p>
                    <div className="cv-contact-info">
                      <div className="cv-contact-item">
                        <i className="fas fa-phone" />
                        <span>{candidateDetails.phone_number || "N/A"}</span>
                      </div>
                      <div className="cv-contact-item">
                        <i className="fas fa-map-marker-alt" />
                        <span>{candidateDetails.city}, {candidateDetails.nationality}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="cv-section">
                  <h3 className="cv-section-title">Personal Information</h3>
                  <div className="cv-info-grid">
                    <div className="cv-info-item">
                      <span className="cv-info-label">Date of Birth</span>
                      <span className="cv-info-value">
                        {candidateDetails.date_of_birth
                          ? new Date(candidateDetails.date_of_birth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                          : "-"}
                      </span>
                    </div>
                    <div className="cv-info-item">
                      <span className="cv-info-label">Gender</span>
                      <span className="cv-info-value">{candidateDetails.gender || "-"}</span>
                    </div>
                    <div className="cv-info-item">
                      <span className="cv-info-label">Nationality</span>
                      <span className="cv-info-value">{candidateDetails.nationality || "-"}</span>
                    </div>
                    <div className="cv-info-item">
                      <span className="cv-info-label">Religion</span>
                      <span className="cv-info-value">{candidateDetails.religion || "-"}</span>
                    </div>
                    <div className="cv-info-item">
                      <span className="cv-info-label">Marital Status</span>
                      <span className="cv-info-value">{candidateDetails.marital_status || "-"}</span>
                    </div>
                    <div className="cv-info-item">
                      <span className="cv-info-label">Current Location</span>
                      <span className="cv-info-value">{candidateDetails.current_location || "-"}</span>
                    </div>
                    <div className="cv-info-item">
                      <span className="cv-info-label">Preferred Work Country</span>
                      <span className="cv-info-value">{candidateDetails.preferred_work_country || "-"}</span>
                    </div>
                  </div>
                </div>

                <div className="cv-section">
                  <h3 className="cv-section-title">Professional Summary</h3>
                  <p className="cv-summary-text">{candidateDetails.bio || candidateDetails.occupation || "No summary provided"}</p>
                </div>

                <div className="cv-section">
                  <h3 className="cv-section-title">Professional Details</h3>
                  <div className="cv-info-grid">
                    <div className="cv-info-item">
                      <span className="cv-info-label">Job Category</span>
                      <span className="cv-info-value">{candidateDetails.job_category || "-"}</span>
                    </div>
                    <div className="cv-info-item">
                      <span className="cv-info-label">Skill Level</span>
                      <span className="cv-info-value">{parseSkillsForDisplay(candidateDetails.skill_level) || "-"}</span>
                    </div>
                    <div className="cv-info-item">
                      <span className="cv-info-label">Education Level</span>
                      <span className="cv-info-value">{candidateDetails.education_level || "-"}</span>
                    </div>
                    <div className="cv-info-item">
                      <span className="cv-info-label">Medical Status</span>
                      <span className="cv-info-value">{candidateDetails.medical_status || "-"}</span>
                    </div>
                  </div>
                </div>

                {candidateDetails.language_skills && (
                  <div className="cv-section">
                    <h3 className="cv-section-title">Language Skills</h3>
                    <div className="cv-skills-list">
                      {parseLanguageSkillsForDisplay(candidateDetails.language_skills).map((lang, i) => (
                        <span key={i} className="cv-skill-tag">{lang}</span>
                      ))}
                    </div>
                  </div>
                )}

                {candidateDetails.cv && (
                  <div className="cv-section">
                    <h3 className="cv-section-title">Curriculum Vitae</h3>
                    <a
                      href={getCandidateCvUrl(candidateDetails.cv) || "#"}
                      onClick={(event) => downloadResume(event, candidateDetails.cv, "CV")}
                      className="cv-resume-link"
                    >
                      <i className="fas fa-file-pdf" /> Download CV
                    </a>
                  </div>
                )}

                {candidateDetails.resume_url && (
                  <div className="cv-section">
                    <h3 className="cv-section-title">Resume</h3>
                    <a
                      href={getCandidateCvUrl(candidateDetails.resume_url) || "#"}
                      onClick={(event) => downloadResume(event, candidateDetails.resume_url, "resume")}
                      className="cv-resume-link"
                    >
                      <i className="fas fa-file-pdf" /> Download Full Resume
                    </a>
                  </div>
                )}

                {candidateDetails.passport_number && (
                  <div className="cv-section">
                    <h3 className="cv-section-title">Travel Documents</h3>
                    <div className="cv-info-item">
                      <span className="cv-info-label">Passport Number</span>
                      <span className="cv-info-value">{candidateDetails.passport_number}</span>
                    </div>
                  </div>
                )}

                <div className="cv-modal-actions">
                  <button onClick={closeCandidateModal} className="cv-action-btn cv-close-action">Close</button>
                  <a
                    href={buildWhatsAppLink(candidateDetails)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cv-action-btn cv-whatsapp-action"
                  >
                    <i className="fab fa-whatsapp" /> WhatsApp
                  </a>
                </div>
              </div>
            ) : (
              <div className="cv-error-state">Failed to load candidate profile</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Home18Page;
