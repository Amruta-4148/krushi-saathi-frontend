import { useEffect, useRef, useState } from 'react'
import {
  askAdvisor,
  createFarmerChat,
  deleteFarmerChat,
  getFarmerChat,
  getFarmerChats,
  signOutFarmer,
  updateFarmerProfile,
} from './api'

const languageLabels = {
  Marathi: 'मराठी',
  Hindi: 'हिंदी',
  English: 'English',
}

const copy = {
  Marathi: {
    newChat: 'नवीन चॅट', chats: 'तुमच्या चॅट्स', placeholder: 'शेतीबद्दल काहीही विचारा…',
    welcome: 'नमस्कार! आज शेतीबद्दल काय जाणून घ्यायचं आहे?', thinking: 'कृषी साथी उत्तर देत आहे…',
    location: 'शेताचे ठिकाण बदला', save: 'ठिकाण जतन करा', saved: 'जतन झाले', logout: 'बाहेर पडा',
    state: 'राज्य', district: 'जिल्हा / शहर', taluka: 'तालुका', village: 'गाव',
    empty: 'अजून चॅट नाही. नवीन चॅट सुरू करा.', voice: 'आवाजाने विचारा', deleteChat: 'चॅट हटवा', confirmDelete: 'हा चॅट आणि त्यातील सर्व संदेश हटवायचे आहेत का?',
  },
  Hindi: {
    newChat: 'नई चैट', chats: 'आपकी चैट', placeholder: 'खेती के बारे में कुछ भी पूछें…',
    welcome: 'नमस्ते! आज खेती के बारे में क्या जानना चाहेंगे?', thinking: 'कृषि साथी जवाब दे रहा है…',
    location: 'खेत का स्थान बदलें', save: 'स्थान सहेजें', saved: 'सहेज लिया गया', logout: 'लॉग आउट',
    state: 'राज्य', district: 'ज़िला / शहर', taluka: 'तालुका', village: 'गाँव',
    empty: 'अभी कोई चैट नहीं है। नई चैट शुरू करें।', voice: 'आवाज़ से पूछें', deleteChat: 'चैट हटाएँ', confirmDelete: 'क्या आप यह चैट और इसके संदेश हटाना चाहते हैं?',
  },
  English: {
    newChat: 'New chat', chats: 'Your chats', placeholder: 'Ask anything about farming…',
    welcome: 'Hello! What would you like to know about farming today?', thinking: 'Krushi Saathi is thinking…',
    location: 'Change farm location', save: 'Save location', saved: 'Saved', logout: 'Sign out',
    state: 'State', district: 'District / city', taluka: 'Taluka', village: 'Village',
    empty: 'No chats yet. Start a new chat.', voice: 'Ask by voice', deleteChat: 'Delete chat', confirmDelete: 'Delete this chat and all its messages?',
  },
}

function normalizeLanguage(value) {
  const normalized = String(value || '').toLowerCase()
  if (normalized.startsWith('mar') || normalized === 'mr') return 'Marathi'
  if (normalized.startsWith('hin') || normalized === 'hi') return 'Hindi'
  return 'English'
}

function chatMessages(conversations = []) {
  return conversations.flatMap((item, index) => [
    { id: `${item.created_at}-${index}-q`, role: 'user', content: item.question },
    { id: `${item.created_at}-${index}-a`, role: 'assistant', content: item.answer },
  ])
}

export default function ChatWorkspace({ farmer: initialFarmer, onFarmerUpdated, onLogout }) {
  const [farmer, setFarmer] = useState(initialFarmer)
  const [language, setLanguage] = useState(normalizeLanguage(initialFarmer.preferred_language))
  const [chats, setChats] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [locationForm, setLocationForm] = useState({
    state: initialFarmer.state || '', district: initialFarmer.district || '',
    taluka: initialFarmer.taluka || '', village: initialFarmer.village || '',
  })
  const [notice, setNotice] = useState('')
  const [deletingChatId, setDeletingChatId] = useState(null)
  const bottomRef = useRef(null)
  const labels = copy[language]

  useEffect(() => {
    let cancelled = false
    getFarmerChats().then(async (result) => {
      if (cancelled) return
      setChats(result.chats || [])
      if (result.chats?.length) {
        const latest = result.chats[0]
        const detail = await getFarmerChat(latest.id)
        if (!cancelled) {
          setActiveChatId(latest.id)
          setMessages(chatMessages(detail.conversations))
        }
      }
    }).catch((error) => {
      if (!cancelled) setNotice(error.message)
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const startNewChat = async () => {
    try {
      const result = await createFarmerChat()
      setChats((current) => [result.chat, ...current])
      setActiveChatId(result.chat.id)
      setMessages([])
      setNotice('')
    } catch (error) {
      setNotice(error.message)
    }
  }

  const openChat = async (chatId) => {
    setActiveChatId(chatId)
    setMessages([])
    try {
      const result = await getFarmerChat(chatId)
      setMessages(chatMessages(result.conversations))
    } catch (error) {
      setNotice(error.message)
    }
  }

  const removeChat = async (chatId) => {
    if (!window.confirm(labels.confirmDelete)) return
    setDeletingChatId(chatId)
    try {
      await deleteFarmerChat(chatId)
      const remaining = chats.filter((chat) => chat.id !== chatId)
      setChats(remaining)
      if (activeChatId === chatId) {
        const nextChat = remaining[0]
        if (nextChat) {
          await openChat(nextChat.id)
        } else {
          setActiveChatId(null)
          setMessages([])
        }
      }
      setNotice('')
    } catch (error) {
      setNotice(error.message)
    } finally {
      setDeletingChatId(null)
    }
  }

  const changeLanguage = async (nextLanguage) => {
    setLanguage(nextLanguage)
    try {
      const result = await updateFarmerProfile({ preferred_language: nextLanguage })
      setFarmer(result.profile)
      onFarmerUpdated(result.profile)
    } catch (error) {
      setNotice(error.message)
    }
  }

  const saveLocation = async (event) => {
    event.preventDefault()
    try {
      const result = await updateFarmerProfile(locationForm)
      setFarmer(result.profile)
      onFarmerUpdated(result.profile)
      setProfileOpen(false)
      setNotice(labels.saved)
    } catch (error) {
      setNotice(error.message)
    }
  }

  const sendMessage = async (event) => {
    event?.preventDefault()
    const content = question.trim()
    if (!content || loading) return
    setQuestion('')
    setMessages((current) => [...current, { id: `${Date.now()}-q`, role: 'user', content }])
    setLoading(true)
    try {
      let chatId = activeChatId
      if (!chatId) {
        const created = await createFarmerChat()
        chatId = created.chat.id
        setActiveChatId(chatId)
        setChats((current) => [created.chat, ...current])
      }
      const result = await askAdvisor(content, language, chatId)
      setMessages((current) => [...current, {
        id: `${Date.now()}-a`, role: 'assistant', content: result.answer || '…',
      }])
      const updatedChats = await getFarmerChats()
      setChats(updatedChats.chats || [])
    } catch (error) {
      setMessages((current) => [...current, {
        id: `${Date.now()}-error`, role: 'assistant', content: error.message,
      }])
    } finally {
      setLoading(false)
    }
  }

  const voiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setNotice('Voice input is not supported in this browser.')
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = language === 'Marathi' ? 'mr-IN' : language === 'Hindi' ? 'hi-IN' : 'en-IN'
    recognition.onresult = (event) => setQuestion((current) => `${current} ${event.results[0][0].transcript}`.trim())
    recognition.start()
  }

  const logout = async () => {
    try {
      await signOutFarmer()
    } finally {
      onLogout()
    }
  }

  return (
    <main className="farmer-chat-app">
      <aside className="farmer-chat-sidebar">
        <a className="farmer-chat-brand" href="/">🌾 <span>Krushi Saathi</span></a>
        <button className="farmer-new-chat" type="button" onClick={startNewChat}>＋ <span>{labels.newChat}</span></button>
        <p className="chat-history-label">{labels.chats}</p>
        <nav className="farmer-chat-list" aria-label={labels.chats}>
          {chats.length === 0 && <p className="chat-list-empty">{labels.empty}</p>}
          {chats.map((chat) => <div key={chat.id} className={`farmer-chat-row ${activeChatId === chat.id ? 'active' : ''}`}>
            <button type="button" className="farmer-chat-item" onClick={() => openChat(chat.id)} title={chat.title}>{chat.title}</button>
            <button type="button" className="farmer-chat-delete" onClick={() => removeChat(chat.id)} disabled={deletingChatId === chat.id} title={labels.deleteChat} aria-label={`${labels.deleteChat}: ${chat.title}`}>🗑</button>
          </div>)}
        </nav>
        <div className="farmer-sidebar-footer">
          <div className="farmer-avatar">{farmer.full_name?.slice(0, 1)?.toUpperCase() || 'F'}</div>
          <div className="farmer-identity"><strong>{farmer.full_name}</strong><span>{farmer.village}, {farmer.district}</span></div>
          <button className="signout-button" type="button" onClick={logout} title={labels.logout}>↪</button>
        </div>
      </aside>

      <section className="farmer-chat-content">
        <header className="farmer-chat-header">
          <div className="farmer-mobile-brand">🌾 <strong>Krushi Saathi</strong></div>
          <button className="location-button" type="button" onClick={() => setProfileOpen((open) => !open)}>⌖ <span>{farmer.village}, {farmer.district}</span></button>
          <select aria-label="Advisory language" value={language} onChange={(event) => changeLanguage(event.target.value)}>
            {Object.entries(languageLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </header>

        {profileOpen && <form className="location-popover" onSubmit={saveLocation}>
          <h3>{labels.location}</h3>
          <label>{labels.state}<input required value={locationForm.state} onChange={(event) => setLocationForm({ ...locationForm, state: event.target.value })} /></label>
          <label>{labels.district}<input required value={locationForm.district} onChange={(event) => setLocationForm({ ...locationForm, district: event.target.value })} /></label>
          <label>{labels.taluka}<input required value={locationForm.taluka} onChange={(event) => setLocationForm({ ...locationForm, taluka: event.target.value })} /></label>
          <label>{labels.village}<input required value={locationForm.village} onChange={(event) => setLocationForm({ ...locationForm, village: event.target.value })} /></label>
          <button type="submit">{labels.save}</button>
        </form>}

        <div className="farmer-transcript" aria-live="polite">
          {messages.length === 0 && <div className="farmer-chat-welcome"><span>🌱</span><h1>{labels.welcome}</h1><p>{farmer.village}, {farmer.district} · {languageLabels[language]}</p></div>}
          {messages.map((message) => <article key={message.id} className={`farmer-message ${message.role}`}>
            {message.role === 'assistant' && <span className="farmer-assistant-icon">🌾</span>}
            <div>{message.content}</div>
          </article>)}
          {loading && <article className="farmer-message assistant"><span className="farmer-assistant-icon">🌾</span><div className="thinking-text">{labels.thinking}</div></article>}
          <div ref={bottomRef} />
        </div>

        <div className="farmer-composer-wrap">
          <form className="farmer-composer" onSubmit={sendMessage}>
            <textarea rows="2" value={question} placeholder={labels.placeholder} aria-label={labels.placeholder} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage() } }} />
            <div className="farmer-composer-actions"><button type="button" onClick={voiceInput} aria-label={labels.voice}>🎙️</button><button type="submit" disabled={!question.trim() || loading} aria-label="Send">↑</button></div>
          </form>
          {notice && <p className="farmer-chat-notice">{notice}</p>}
        </div>
      </section>
    </main>
  )
}
