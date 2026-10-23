import { useEffect, useState } from 'react'
import './App.css'
import farmerRobot from './assets/farmer-robot.png'
import robotBody from './assets/robot-body-cutout.png'
import robotHead from './assets/robot-head.png'
import { useLocation, useNavigate } from 'react-router-dom'
import { getCurrentFarmer } from './api'
import AuthModal from './AuthModal'
import ChatWorkspace from './ChatWorkspace'

const text = {
  mr: {
    brandName: 'कृषी साथी',
    why: 'आमचं वैशिष्ट्य',
    features: 'फीचर्स',
    eyebrow: 'शेतकऱ्यांसाठी डिजिटल साथी',
    title: 'शेतीचे प्रश्न?',
    subtitle: 'उत्तर तुमच्या भाषेत.',
    description: 'पीक, कीड आणि सिंचनाबद्दल सोपं मार्गदर्शन मिळवा.',
    button: 'Get Started',
    tip: '🌱 आजची शेती टिप',
    tipText: 'तुमच्या शेतासाठी सोपं मार्गदर्शन',
    featureSection: {
  eyebrow: 'आम्ही कशी मदत करतो',
  title: 'शेतीच्या प्रत्येक टप्प्यावर तुमच्या सोबत',
  description: 'योग्य निर्णय घेण्यासाठी सोपे आणि उपयुक्त मार्गदर्शन.',
  crop: 'पीक मार्गदर्शन',
  cropText: 'पीक निवड आणि काळजीसाठी उपयुक्त टिप्स मिळवा.',
  pest: 'कीड व्यवस्थापन',
  pestText: 'सामान्य किडी ओळखा आणि पिकांचे संरक्षण करा.',
  irrigation: 'सिंचन मार्गदर्शन',
      irrigationText: 'शेतासाठी पाण्याचे नियोजन करण्यास सोपे मार्गदर्शन.',
  },

  askSection: {
    eyebrow: 'कृषी साथीला विचारा',
    title: 'तुमच्या शेतात काय घडत आहे?',
    description: 'तुम्ही काय पिकवत आहात किंवा काय दिसले ते सांगा.',
    placeholder: 'उदा. टोमॅटोची पाने पिवळी पडत आहेत…',
    button: 'मार्गदर्शन मिळवा',
  },
},
  hi: {
    brandName: 'कृषि साथी',
    why: 'हमारी खासियत',
    features: 'फ़ीचर्स',
    eyebrow: 'किसानों के लिए डिजिटल साथी',
    title: 'खेती से जुड़े सवाल?',
    subtitle: 'जवाब आपकी भाषा में।',
    description: 'फसल, कीट और सिंचाई पर आसान मार्गदर्शन पाएं।',
    button: 'Get Started',
    tip: '🌱 आज की खेती की सलाह',
    tipText: 'आपके खेत के लिए आसान मार्गदर्शन',
    featureSection: {
  eyebrow: 'हम किन कामों में मदद करते हैं',
  title: 'खेती के हर कदम पर आपका साथ',
  description: 'बेहतर फैसले लेने के लिए सरल और उपयोगी मार्गदर्शन।',
  crop: 'फसल संबंधी मार्गदर्शन',
  cropText: 'फसल चुनने और उनकी देखभाल के लिए उपयोगी सुझाव पाएँ।',
  pest: 'कीटों से बचाव',
  pestText: 'आम कीटों को पहचानें और अपनी फसलों की रक्षा करें।',
  irrigation: 'सिंचाई के सुझाव',
      irrigationText: 'खेतों में पानी देने की योजना के लिए आसान सलाह।',
  },

  askSection: {
    eyebrow: 'कृषि साथी से पूछें',
    title: 'आपके खेत में क्या हो रहा है?',
    description: 'बताएँ कि आप क्या उगा रहे हैं या आपने क्या देखा है।',
    placeholder: 'उदाहरण: टमाटर के पत्ते पीले पड़ रहे हैं…',
    button: 'सलाह पाएँ',
  },
},
  en: {
    brandName: 'Krushi Saathi',
    why: 'Why Krushi Saathi',
    features: 'Features',
    eyebrow: 'A digital companion for farmers',
    title: 'Questions about farming?',
    subtitle: 'Answers in your language.',
    description: 'Get simple guidance on crops, pests, and irrigation.',
    button: 'Get Started',
    tip: '🌱 Today’s farming tip',
    tipText: 'Simple guidance for your farm',
    featureSection: {
  eyebrow: 'What we help with',
  title: 'Support for every step on your farm',
  description: 'Simple, practical guidance to help you make confident decisions.',
  crop: 'Crop guidance',
  cropText: 'Get helpful tips for choosing and caring for your crops.',
  pest: 'Pest support',
  pestText: 'Learn how to spot common pests and protect your plants.',
  irrigation: 'Irrigation tips',
      irrigationText: 'Plan watering with simple advice for your fields.',
  },

  askSection: {
    eyebrow: 'Ask Krushi Saathi',
    title: 'What is happening in your field?',
    description: 'Tell us what you are growing or what you have noticed.',
    placeholder: 'For example: Tomato leaves are turning yellow…',
    button: 'Get guidance',
  },
},
}

function App() {
  const [language, setLanguage] = useState('mr')
  const words = text[language]
  const location = useLocation()
  const navigate = useNavigate()
  const [farmer, setFarmer] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [weather, setWeather] = useState('Weather loading…')
  const [locationName, setLocationName] = useState('Finding location…')

  useEffect(() => {
    if (!localStorage.getItem('krushi-saathi-session')) {
      setAuthChecked(true)
      return
    }
    getCurrentFarmer()
      .then((data) => setFarmer(data.farmer))
      .catch(() => localStorage.removeItem('krushi-saathi-session'))
      .finally(() => setAuthChecked(true))
  }, [])

  useEffect(() => {
    if (location.pathname === '/ask' && authChecked && !farmer) setAuthOpen(true)
  }, [location.pathname, authChecked, farmer])

  const handleAuthenticated = (signedInFarmer) => {
    setFarmer(signedInFarmer)
    setAuthOpen(false)
    navigate('/ask')
  }

  const handleLogout = () => {
    setFarmer(null)
    navigate('/')
  }
  const sayHi = () => {
  const greetings = {
    en: ["Hi, welcome to Krushi Saathi!", "en-IN"],
    hi: ["नमस्ते, कृषि साथी में आपका स्वागत है!", "hi-IN"],
    mr: ["नमस्कार, कृषी साथीमध्ये तुमचं स्वागत आहे!", "mr-IN"],
  };

  const [message, voice] = greetings[language] || greetings.en;
  const greeting = new SpeechSynthesisUtterance(message);
  greeting.lang = voice;
  window.speechSynthesis.speak(greeting);
};
useEffect(() => {
  const timer = setTimeout(() => {
    const greetings = {
      en: ["Hi, welcome to Krushi Saathi!", "en-IN"],
      hi: ["नमस्ते, कृषि साथी में आपका स्वागत है!", "hi-IN"],
      mr: ["नमस्कार, कृषी साथीमध्ये तुमचं स्वागत आहे!", "mr-IN"],
    };

    const [message, voice] = greetings[language] || greetings.en;
    const greeting = new SpeechSynthesisUtterance(message);
    greeting.lang = voice;
    window.speechSynthesis.speak(greeting);
  }, 1000);

  return () => clearTimeout(timer);
}, [language]);

useEffect(() => {
  if (!navigator.geolocation) {
    setWeather('Location unavailable')
    return
  }

  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,weather_code&timezone=auto`
        )

        if (!response.ok) throw new Error('Weather request failed')

        const data = await response.json()
        setWeather(`${Math.round(data.current.temperature_2m)}°C`)
        try {
  const locationResponse = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=en`
  )
  const locationData = await locationResponse.json()

  setLocationName(
    locationData.principalSubdivision || locationData.city || 'Your area'
  )
} catch {
  setLocationName('Your area')
}
      } catch {
        setWeather('Weather unavailable')
      }
    },
    () => setWeather('Allow location'),
    { timeout: 10000 }
  )
}, [])
if (location.pathname === '/ask' && farmer) {
  return <ChatWorkspace farmer={farmer} onFarmerUpdated={setFarmer} onLogout={handleLogout} />
}

if (!authChecked && location.pathname === '/ask') {
  return <main className="auth-loading">Loading your farmer account…</main>
}

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#home">🌾 Krushi Saathi</a>

        <nav className="site-nav" aria-label="Main navigation">
          <a href="#why">{words.why}</a>
          <a href="#features">{words.features}</a>

          <select
            className="language-select"
            aria-label="Language"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          >
            <option value="mr">मराठी</option>
            <option value="hi">हिंदी</option>
            <option value="en">English</option>
          </select>
        </nav>
      </header>

    <main id="home">
  <section className="hero" id="why">
    <div className="hero-visual">
      <div className="weather-pill">🌤️ {weather} · {locationName}</div>

      <div className="character-wrap">
        <img className="farmer-body" src={robotBody} alt="" />

        <div className="farmer-head-layer">
          <img
            className="farmer-head"
            src={robotHead}
            alt="Friendly farmer robot"
            onClick={sayHi}
          />
          <span className="blink-eye blink-eye-left" aria-hidden="true" />
          <span className="blink-eye blink-eye-right" aria-hidden="true" />
          <span className="mouth-mask" aria-hidden="true" />
          <span className="robot-smile" aria-hidden="true" />
        </div>
      </div>

      <div className="tip-card">
        <p>{words.tip}</p>
        <strong>{words.tipText}</strong>
      </div>
    </div>

    <div className="hero-copy">

            <p className="eyebrow">{words.eyebrow}</p>
            <h1>
              {words.title}
              <span>{words.subtitle}</span>
            </h1>
            <p>{words.description}</p>
            <button className="primary-button get-started-button" type="button" onClick={() => farmer ? navigate('/ask') : setAuthOpen(true)}>
              {words.button} →
            </button>
          </div>
        </section>
        
      </main>
      <section className="features" id="features">
  <div className="features-heading">
    <p className="eyebrow">{words.featureSection.eyebrow}</p>
    <h2>{words.featureSection.title}</h2>
    <p>{words.featureSection.description}</p>
  </div>

  <div className="feature-grid">
    <article className="feature-card">
      <span>🌱</span>
      <h3>{words.featureSection.crop}</h3>
      <p>{words.featureSection.cropText}</p>
    </article>

    <article className="feature-card">
      <span>🐛</span>
      <h3>{words.featureSection.pest}</h3>
      <p>{words.featureSection.pestText}</p>
    </article>

    <article className="feature-card">
      <span>💧</span>
      <h3>{words.featureSection.irrigation}</h3>
      <p>{words.featureSection.irrigationText}</p>
    </article>
  </div>
</section>
      {authOpen && <AuthModal
        onClose={() => {
          setAuthOpen(false)
          if (location.pathname === '/ask') navigate('/')
        }}
        onAuthenticated={handleAuthenticated}
      />}
    </>
  )
}

export default App
