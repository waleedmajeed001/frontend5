'use client'

import { useState, useRef, useEffect } from 'react'
import { SendHorizonal, RefreshCcw, Paperclip, MessageSquare, X, Clock, Calendar, Globe } from 'lucide-react'

export default function ChatlitClone() {
  const [input, setInput] = useState('')
  const [showReadMe, setShowReadMe] = useState(false)
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [showChatBar, setShowChatBar] = useState(false)
  const [isApiConnected, setIsApiConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingMessage, setTypingMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const chatContainerRef = useRef<HTMLDivElement | null>(null)

  // Check API connection on component mount
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const response = await fetch('https://aiagentitimedatedaybackend.vercel.app/')
        if (response.ok) {
          setIsApiConnected(true)
        } else {
          setIsApiConnected(false)
        }
      } catch (error) {
        setIsApiConnected(false)
        console.error('API connection error:', error)
      }
    }

    checkApiConnection()
    const interval = setInterval(checkApiConnection, 30000)
    return () => clearInterval(interval)
  }, [])

  // Smooth scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth' as ScrollBehavior,
        block: 'end' as ScrollLogicalPosition
      })
    }
  }, [messages])

  // Handle guide animation
  useEffect(() => {
    if (showReadMe) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [showReadMe])

  // Add typing indicator effect
  useEffect(() => {
    if (isTyping) {
      const dots = ['.', '..', '...']
      let currentDot = 0
      const interval = setInterval(() => {
        setTypingMessage(`Time Assistant is typing${dots[currentDot]}`)
        currentDot = (currentDot + 1) % dots.length
      }, 500)
      return () => clearInterval(interval)
    }
  }, [isTyping])

  const handleSendMessage = async () => {
    if (input.trim() && !isLoading) {
      setIsLoading(true)
      setMessages(prev => [...prev, { text: input, isUser: true }])
      const userInput = input
      setInput('')

      // Show typing indicator
      setIsTyping(true)

      try {
        const response = await fetch('https://aiagentitimedatedaybackend.vercel.app/time', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ location: userInput }),
        })

        if (!response.ok) {
          throw new Error('Failed to fetch time information')
        }

        const data = await response.json()
        
        let responseMessage = ''
        if (data.answer) {
          responseMessage = data.answer
        } else {
          responseMessage = `Current time in ${data.location}:\n` +
            `🕒 Time: ${data.time}\n` +
            `📅 Date: ${data.date}\n` +
            `📆 Day: ${data.day}\n` +
            `🌍 Timezone: ${data.timezone}`
        }

        // Add slight delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsTyping(false)
        setMessages(prev => [...prev, { text: responseMessage, isUser: false }])
      } catch (error) {
        setIsTyping(false)
        setMessages(prev => [...prev, { 
          text: "Sorry, I couldn't fetch the time information. Please try again with a different location.", 
          isUser: false 
        }])
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleBlockClick = (prompt: string) => {
    setTransitioning(true)
    setShowChatBar(true)
    setTimeout(() => {
      setMessages([{ text: prompt, isUser: false }])
      setTransitioning(false)
    }, 300)
  }

  const handleNewChat = () => {
    setIsRefreshing(true)
    setShowChatBar(false)
    setTimeout(() => {
      setMessages([])
      setInput('')
      setIsRefreshing(false)
      setTransitioning(false)
    }, 300)
  }

  const handleGuideToggle = () => {
    setShowReadMe(prev => !prev)
  }

  return (
    <div className="flex flex-col min-h-screen h-[100dvh] bg-[#0a0a0a] text-white font-sans relative overflow-hidden">
      {/* Top bar */}
      <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-800 bg-[#0f0f0f] sticky top-0 z-10 backdrop-blur-sm bg-opacity-80 transition-all duration-300">
        <div className="flex items-center gap-2">
          <MessageSquare size={24} className="text-[#b01569] transition-transform duration-300 hover:scale-110" aria-hidden="true" />
          <h1 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-[#b01569] to-[#c82478] bg-clip-text text-transparent">Time & Date Chat</h1>
          <div 
            className={`w-2 h-2 rounded-full ${isApiConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse ml-2 transition-all duration-300`}
            role="status"
            aria-label={isApiConnected ? 'API Connected' : 'API Disconnected'}
          />
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            className="px-3 sm:px-4 py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#2d2d2d] transition-all duration-300 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#b01569] focus:ring-offset-2 focus:ring-offset-[#0a0a0a] transform hover:scale-105 active:scale-95"
            onClick={handleGuideToggle}
            aria-expanded={showReadMe}
            aria-controls="guide-section"
          >
            {showReadMe ? 'Close' : 'Guide'}
          </button>
          <button 
            onClick={handleNewChat}
            className="p-2 rounded-lg bg-[#1a1a1a] hover:bg-[#2d2d2d] transition-all duration-300 group relative focus:outline-none focus:ring-2 focus:ring-[#b01569] focus:ring-offset-2 focus:ring-offset-[#0a0a0a] transform hover:scale-105 active:scale-95"
            title="Start New Chat"
            aria-label="Start New Chat"
          >
            <RefreshCcw 
              size={20} 
              className={`text-gray-400 group-hover:text-white transition-colors ${isRefreshing ? 'animate-spin' : ''}`} 
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Welcome section - shown when no messages */}
        {messages.length === 0 && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 animate-fadein">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8 sm:mb-12 animate-slideup">
                <div className="relative flex justify-center mb-6 sm:mb-8">
                  <div className="absolute inset-0 bg-[#b01569] blur-2xl opacity-20 rounded-full w-24 h-24 sm:w-32 sm:h-32 mx-auto animate-pulse-slow" />
                  <MessageSquare size={36} className="text-[#b01569] relative z-10 sm:w-12 sm:h-12 animate-bounce-slow" />
            </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold mb-3 sm:mb-4 bg-gradient-to-r from-[#b01569] to-[#c82478] bg-clip-text text-transparent animate-fadein">
                  Time & Date Information
                </h2>
                <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto animate-fadein-delay">
                  Get real-time information about time, date, and day for any location worldwide
                </p>
              </div>

              {/* Feature cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
                {/* Time Card */}
                <button
                  onClick={() => handleBlockClick("Which city or country's time do you need?")}
                  className="group relative bg-[#18181b] rounded-2xl p-6 sm:p-8 flex flex-col items-center text-left hover:bg-[#23232a] transition-all duration-300 hover:scale-[1.02] shadow-xl animate-slideup-delay-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#b01569] to-[#c82478] opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300"></div>
                  <Clock size={32} className="mb-4 text-[#e6007a] transition-transform duration-300 group-hover:scale-110" />
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 transition-colors duration-300 group-hover:text-[#e6007a]">Check Time</h3>
                  <p className="text-gray-300 text-sm sm:text-base mb-4">Get current time for any location worldwide</p>
                  <span className="text-[#e6007a] font-medium flex items-center gap-2 mt-auto group-hover:underline transition-all duration-300">
                    Get Started <span className="transform transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
                  </span>
                </button>

                {/* Date Card */}
                <button
                  onClick={() => handleBlockClick("Which city or country's date do you need?")}
                  className="group relative bg-[#18181b] rounded-2xl p-6 sm:p-8 flex flex-col items-center text-left hover:bg-[#23232a] transition-all duration-300 hover:scale-[1.02] shadow-xl animate-slideup-delay-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#b01569] to-[#c82478] opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300"></div>
                  <Calendar size={32} className="mb-4 text-[#e6007a] transition-transform duration-300 group-hover:scale-110" />
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 transition-colors duration-300 group-hover:text-[#e6007a]">Check Date</h3>
                  <p className="text-gray-300 text-sm sm:text-base mb-4">Find out the current date in any timezone</p>
                  <span className="text-[#e6007a] font-medium flex items-center gap-2 mt-auto group-hover:underline transition-all duration-300">
                    Get Started <span className="transform transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
                  </span>
                </button>

                {/* World Time Card */}
                <button
                  onClick={() => handleBlockClick("Which city or country do you want information about?")}
                  className="group relative bg-[#18181b] rounded-2xl p-6 sm:p-8 flex flex-col items-center text-left hover:bg-[#23232a] transition-all duration-300 hover:scale-[1.02] shadow-xl animate-slideup-delay-3"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#b01569] to-[#c82478] opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300"></div>
                  <Globe size={32} className="mb-4 text-[#e6007a] transition-transform duration-300 group-hover:scale-110" />
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 transition-colors duration-300 group-hover:text-[#e6007a]">World Time</h3>
                  <p className="text-gray-300 text-sm sm:text-base mb-4">Compare times across different locations</p>
                  <span className="text-[#e6007a] font-medium flex items-center gap-2 mt-auto group-hover:underline transition-all duration-300">
                    Get Started <span className="transform transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat messages area */}
        <div 
          ref={chatContainerRef}
          className={`flex-1 overflow-y-auto p-4 sm:p-6 ${messages.length > 0 ? 'block animate-fadein' : 'hidden'}`}
        >
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-slidein`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col max-w-[85%] sm:max-w-[70%]">
                  <div className={`text-xs mb-1 px-2 ${message.isUser ? 'text-right text-gray-400' : 'text-left text-[#b01569]'} transition-colors duration-300`}>
                    {message.isUser ? 'You' : 'Time Assistant'}
                  </div>
                  <div
                    className={`p-3 sm:p-4 rounded-2xl shadow-lg relative animate-fadein-slidein ${
                      message.isUser
                        ? 'bg-gradient-to-r from-[#b01569] to-[#c82478] text-white'
                        : 'bg-[#1a1a1a] text-gray-200'
                    } transition-all duration-300 hover:shadow-xl group`}
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: 'backwards',
                    }}
                  >
                    {!message.isUser && (
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#1a1a1a] transform rotate-45"></div>
                    )}
                    <div className="relative z-10 whitespace-pre-line text-base">
                      {message.text.split('\n').map((line, i) => (
                        <div key={i} className="animate-fadein-line" style={{ animationDelay: `${i * 100}ms` }}>
                          {line}
                        </div>
                      ))}
                    </div>
                    {message.isUser && (
                      <div className="absolute inset-0 bg-gradient-to-r from-[#b01569] to-[#c82478] opacity-20 blur-xl rounded-2xl transition-opacity duration-300 group-hover:opacity-30"></div>
                    )}
                    {!message.isUser && (
                      <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a] to-[#23232a] opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start animate-slidein">
                <div className="flex flex-col max-w-[85%] sm:max-w-[70%]">
                  <div className="text-xs mb-1 px-2 text-left text-[#b01569]">
                    Time Assistant
                  </div>
                  <div className="p-3 sm:p-4 rounded-2xl shadow-lg bg-[#1a1a1a] text-gray-200 relative">
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#1a1a1a] transform rotate-45"></div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-[#b01569] rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-[#b01569] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-2 h-2 bg-[#b01569] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Chat input - Always visible */}
        <div className="w-full p-3 sm:p-4 border-t border-gray-800 bg-[#0f0f0f] sticky bottom-0 z-20 shadow-2xl backdrop-blur-sm bg-opacity-80 transition-all duration-300">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center bg-[#1a1a1a] rounded-2xl px-3 sm:px-4 py-3 shadow-lg transform transition-all duration-300 hover:scale-[1.01] relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#b01569] to-[#c82478] opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300"></div>
              <button 
                className="text-gray-400 hover:text-white transition-colors duration-300 relative z-10 p-2 transform hover:scale-110 active:scale-95"
                disabled={isLoading}
              >
                <Paperclip size={20} className="sm:w-5 sm:h-5" aria-hidden="true" />
              </button>
              <input
                type="text"
                placeholder="Type a city name..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1 bg-transparent outline-none px-3 sm:px-4 text-base placeholder-gray-500 text-white relative z-10 disabled:opacity-50 transition-all duration-300"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className={`bg-gradient-to-r from-[#b01569] to-[#c82478] hover:from-[#c82478] hover:to-[#b01569] rounded-full p-2 sm:p-2.5 transition-all transform hover:scale-110 active:scale-95 relative z-10 disabled:opacity-50 disabled:cursor-not-allowed ml-2 ${
                  isLoading ? 'animate-pulse' : ''
                }`}
              >
                <SendHorizonal size={20} className="text-white sm:w-5 sm:h-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Section */}
      <div
        id="guide-section"
        className={`fixed inset-0 bg-[#0a0a0a] transform transition-all duration-500 ease-in-out z-50 ${
          showReadMe ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-title"
      >
        <div className="h-full overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 sm:p-6">
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <h1 id="guide-title" className="text-2xl sm:text-3xl font-semibold bg-gradient-to-r from-[#b01569] to-[#c82478] bg-clip-text text-transparent">Time & Date Checker Guide</h1>
              <button
                onClick={handleGuideToggle}
                className="p-2 rounded-full hover:bg-[#1a1a1a] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#b01569] focus:ring-offset-2 focus:ring-offset-[#0a0a0a] transform hover:scale-110 active:scale-95"
                aria-label="Close guide"
              >
                <X size={24} className="text-gray-400 hover:text-white transition-colors duration-300" aria-hidden="true" />
            </button>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <section className="bg-[#1a1a1a] rounded-xl p-4 sm:p-6 transform transition-all duration-300 hover:scale-[1.02] animate-slideup">
                <h2 className="text-xl sm:text-2xl font-medium mb-4 bg-gradient-to-r from-[#b01569] to-[#c82478] bg-clip-text text-transparent">Overview</h2>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  Get real-time information about time, date, and day of the week for any city or country.
                  Our service provides accurate and up-to-date information for locations worldwide.
                </p>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <section className="bg-[#1a1a1a] rounded-xl p-4 sm:p-6 transform transition-all duration-300 hover:scale-[1.02] animate-slideup-delay-1">
                  <h2 className="text-xl sm:text-2xl font-medium mb-4 bg-gradient-to-r from-[#b01569] to-[#c82478] bg-clip-text text-transparent">Features</h2>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-center gap-2 transition-transform duration-300 hover:translate-x-1">
                      <span className="w-2 h-2 bg-[#b01569] rounded-full animate-pulse" aria-hidden="true"></span>
                      Real-time time zone information
                    </li>
                    <li className="flex items-center gap-2 transition-transform duration-300 hover:translate-x-1">
                      <span className="w-2 h-2 bg-[#b01569] rounded-full animate-pulse" aria-hidden="true"></span>
                      Current date and day details
                    </li>
                    <li className="flex items-center gap-2 transition-transform duration-300 hover:translate-x-1">
                      <span className="w-2 h-2 bg-[#b01569] rounded-full animate-pulse" aria-hidden="true"></span>
                      Global city support
                    </li>
                    <li className="flex items-center gap-2 transition-transform duration-300 hover:translate-x-1">
                      <span className="w-2 h-2 bg-[#b01569] rounded-full animate-pulse" aria-hidden="true"></span>
                      Instant updates
                    </li>
                  </ul>
                </section>

                <section className="bg-[#1a1a1a] rounded-xl p-4 sm:p-6 transform transition-all duration-300 hover:scale-[1.02] animate-slideup-delay-2">
                  <h2 className="text-xl sm:text-2xl font-medium mb-4 bg-gradient-to-r from-[#b01569] to-[#c82478] bg-clip-text text-transparent">How to Use</h2>
                  <div className="space-y-4 text-gray-300">
                    <p className="flex items-center gap-2 transition-transform duration-300 hover:translate-x-1">
                      <span className="text-[#b01569]">1.</span>
                      Type a city name in the chat
                    </p>
                    <p className="flex items-center gap-2 transition-transform duration-300 hover:translate-x-1">
                      <span className="text-[#b01569]">2.</span>
                      Press Enter or click send
                    </p>
                    <p className="flex items-center gap-2 transition-transform duration-300 hover:translate-x-1">
                      <span className="text-[#b01569]">3.</span>
                      Get instant time and date information
                    </p>
                  </div>
                </section>
              </div>

              <section className="bg-[#1a1a1a] rounded-xl p-4 sm:p-6 transform transition-all duration-300 hover:scale-[1.02] animate-slideup-delay-3">
                <h2 className="text-xl sm:text-2xl font-medium mb-4 bg-gradient-to-r from-[#b01569] to-[#c82478] bg-clip-text text-transparent">Tips</h2>
                <ul className="space-y-3 text-gray-300">
                  <li className="transition-transform duration-300 hover:translate-x-1">• You can use city names or country names</li>
                  <li className="transition-transform duration-300 hover:translate-x-1">• For better results, use the official city name</li>
                  <li className="transition-transform duration-300 hover:translate-x-1">• The system automatically detects time zones</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* Add this to your global CSS (e.g. styles/globals.css or in a <style jsx global>)
@keyframes fadein-slidein {
  0% { opacity: 0; transform: translateY(24px) scale(0.98); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes fadein {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes slideup {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes slidein {
  0% { opacity: 0; transform: translateX(-20px); }
  100% { opacity: 1; transform: translateX(0); }
}

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.3; }
}

.animate-fadein-slidein {
  animation: fadein-slidein 0.4s cubic-bezier(0.4,0,0.2,1);
}

.animate-fadein {
  animation: fadein 0.5s ease-out;
}

.animate-fadein-delay {
  animation: fadein 0.5s ease-out 0.2s backwards;
}

.animate-slideup {
  animation: slideup 0.5s ease-out;
}

.animate-slideup-delay-1 {
  animation: slideup 0.5s ease-out 0.1s backwards;
}

.animate-slideup-delay-2 {
  animation: slideup 0.5s ease-out 0.2s backwards;
}

.animate-slideup-delay-3 {
  animation: slideup 0.5s ease-out 0.3s backwards;
}

.animate-slidein {
  animation: slidein 0.4s ease-out;
}

.animate-bounce-slow {
  animation: bounce-slow 3s infinite;
}

.animate-pulse-slow {
  animation: pulse-slow 3s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes fadein-line {
  0% { 
    opacity: 0;
    transform: translateY(10px);
  }
  100% { 
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadein-line {
  animation: fadein-line 0.3s ease-out forwards;
}

@keyframes slidein {
  0% { 
    opacity: 0;
    transform: translateX(-20px);
  }
  100% { 
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slidein {
  animation: slidein 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes fadein-slidein {
  0% { 
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  100% { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-fadein-slidein {
  animation: fadein-slidein 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 1.5s infinite;
}
*/
