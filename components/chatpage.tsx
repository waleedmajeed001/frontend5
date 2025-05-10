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

  const handleSendMessage = async () => {
    if (input.trim() && !isLoading) {
      setIsLoading(true)
      setMessages(prev => [...prev, { text: input, isUser: true }])
      const userInput = input
      setInput('')

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
        await new Promise(resolve => setTimeout(resolve, 500))
        setMessages(prev => [...prev, { text: responseMessage, isUser: false }])
      } catch (error) {
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
      <div className="flex justify-between items-center p-2 sm:p-4 border-b border-gray-800 bg-[#0f0f0f] sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <MessageSquare size={20} className="text-[#b01569]" />
          <h1 className="text-base sm:text-lg font-semibold">Time & Date Chat</h1>
          <div 
            className={`w-2 h-2 rounded-full ${isApiConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse ml-2`}
            title={isApiConnected ? 'API Connected' : 'API Disconnected'}
          />
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            className="px-2 sm:px-3 py-1 rounded-md bg-[#1a1a1a] hover:bg-[#2d2d2d] transition-all duration-300 text-sm sm:text-base"
            onClick={handleGuideToggle}
          >
            {showReadMe ? 'Close' : 'Guide'}
          </button>
          <button 
            onClick={handleNewChat}
            className="p-2 rounded-md bg-[#1a1a1a] hover:bg-[#2d2d2d] transition-all duration-300 group relative"
            title="Start New Chat"
          >
            <RefreshCcw 
              size={18} 
              className={`text-gray-400 group-hover:text-white transition-colors ${isRefreshing ? 'animate-spin' : ''}`} 
            />
          </button>
        </div>
      </div>

      {/* Guide Section with Enhanced Animation */}
      <div
        className={`fixed inset-0 bg-[#0a0a0a] transform transition-all duration-500 ease-in-out z-50 ${
          showReadMe ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="h-full overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-semibold text-[#b01569]">Time & Date Checker Guide</h1>
              <button
                onClick={handleGuideToggle}
                className="p-2 rounded-full hover:bg-[#1a1a1a] transition-all duration-300"
              >
                <X size={24} className="text-gray-400 hover:text-white" />
              </button>
            </div>

            <div className="space-y-8">
              <section className="bg-[#1a1a1a] rounded-xl p-6 transform transition-all duration-300 hover:scale-[1.02]">
                <h2 className="text-2xl font-medium mb-4">Overview</h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Get real-time information about time, date, and day of the week for any city or country.
                  Our service provides accurate and up-to-date information for locations worldwide.
                </p>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="bg-[#1a1a1a] rounded-xl p-6 transform transition-all duration-300 hover:scale-[1.02]">
                  <h2 className="text-2xl font-medium mb-4">Features</h2>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#b01569] rounded-full"></span>
                      Real-time time zone information
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#b01569] rounded-full"></span>
                      Current date and day details
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#b01569] rounded-full"></span>
                      Global city support
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#b01569] rounded-full"></span>
                      Instant updates
                    </li>
                  </ul>
                </section>

                <section className="bg-[#1a1a1a] rounded-xl p-6 transform transition-all duration-300 hover:scale-[1.02]">
                  <h2 className="text-2xl font-medium mb-4">How to Use</h2>
                  <div className="space-y-4 text-gray-300">
                    <p className="flex items-center gap-2">
                      <span className="text-[#b01569]">1.</span>
                      Type a city name in the chat
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-[#b01569]">2.</span>
                      Press Enter or click send
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-[#b01569]">3.</span>
                      Get instant time and date information
                    </p>
                  </div>
                </section>
              </div>

              <section className="bg-[#1a1a1a] rounded-xl p-6 transform transition-all duration-300 hover:scale-[1.02]">
                <h2 className="text-2xl font-medium mb-4">Tips</h2>
                <ul className="space-y-3 text-gray-300">
                  <li>• You can use city names or country names</li>
                  <li>• For better results, use the official city name</li>
                  <li>• The system automatically detects time zones</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Chat messages area */}
      <div 
        ref={chatContainerRef}
        className={`flex-1 flex items-center justify-center overflow-y-auto p-2 sm:p-4 bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f] scroll-smooth`}
      >
        {messages.length === 0 ? (
          <div className={`w-full max-w-6xl mx-auto flex flex-col items-center justify-center transition-all duration-500 ${transitioning ? 'opacity-0 translate-y-8 pointer-events-none' : 'opacity-100 translate-y-0'} px-2 sm:px-4`}>
            <div className="text-center w-full">
              <div className="relative flex justify-center mb-4">
                <div className="absolute inset-0 bg-[#b01569] blur-2xl opacity-20 rounded-full w-24 h-24 sm:w-32 sm:h-32 mx-auto" />
                <MessageSquare size={36} className="text-[#b01569] relative z-10 sm:w-12 sm:h-12" />
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold mb-2 text-[#e6007a] text-center">
                Time & Date Information
              </h2>
              <p className="text-gray-300 mb-6 sm:mb-10 text-center text-sm sm:text-lg">
                Get real-time information about time, date, and day for any location worldwide
              </p>
              <div className="mt-4 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
                {/* Time Card */}
                <button
                  className="relative p-4 sm:p-6 lg:p-8 bg-[#18181b] rounded-2xl flex flex-col items-start shadow-lg hover:scale-105 hover:bg-[#23232a] transition-all duration-300 group w-full min-h-[180px] sm:min-h-[260px]"
                  onClick={() => handleBlockClick("Which city or country's time do you need?")}
                >
                  <Clock size={28} className="mb-3 sm:mb-4 text-[#e6007a]" />
                  <span className="text-lg sm:text-2xl font-bold text-white mb-2">Check Time</span>
                  <span className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 text-left">Get current time for any location worldwide</span>
                  <span className="text-[#e6007a] font-medium flex items-center gap-1 mt-auto group-hover:underline text-sm sm:text-base">
                    Get Started <span aria-hidden>→</span>
                  </span>
                </button>
                {/* Date Card */}
                <button
                  className="relative p-4 sm:p-6 lg:p-8 bg-[#18181b] rounded-2xl flex flex-col items-start shadow-lg hover:scale-105 hover:bg-[#23232a] transition-all duration-300 group w-full min-h-[180px] sm:min-h-[260px]"
                  onClick={() => handleBlockClick("Which city or country's date do you need?")}
                >
                  <Calendar size={28} className="mb-3 sm:mb-4 text-[#e6007a]" />
                  <span className="text-lg sm:text-2xl font-bold text-white mb-2">Check Date</span>
                  <span className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 text-left">Find out the current date in any timezone</span>
                  <span className="text-[#e6007a] font-medium flex items-center gap-1 mt-auto group-hover:underline text-sm sm:text-base">
                    Get Started <span aria-hidden>→</span>
                  </span>
                </button>
                {/* World Time Card */}
                <button
                  className="relative p-4 sm:p-6 lg:p-8 bg-[#18181b] rounded-2xl flex flex-col items-start shadow-lg hover:scale-105 hover:bg-[#23232a] transition-all duration-300 group w-full min-h-[180px] sm:min-h-[260px]"
                  onClick={() => handleBlockClick("Which city or country do you want information about?")}
                >
                  <Globe size={28} className="mb-3 sm:mb-4 text-[#e6007a]" />
                  <span className="text-lg sm:text-2xl font-bold text-white mb-2">World Time</span>
                  <span className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 text-left">Compare times across different locations</span>
                  <span className="text-[#e6007a] font-medium flex items-center gap-1 mt-auto group-hover:underline text-sm sm:text-base">
                    Get Started <span aria-hidden>→</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={`w-full transition-all duration-500 ${isRefreshing ? 'opacity-0 translate-y-8 pointer-events-none' : 'opacity-100 translate-y-0'} px-2 sm:px-4`}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <div className="flex flex-col max-w-[85%] sm:max-w-[70%]">
                  <div className={`text-xs mb-1 px-2 ${message.isUser ? 'text-right text-gray-400' : 'text-left text-[#b01569]'}`}>
                    {message.isUser ? 'You' : 'Time Assistant'}
                  </div>
                  <div
                    className={`p-3 sm:p-4 rounded-2xl relative animate-fadein-slidein ${
                      message.isUser
                        ? 'bg-gradient-to-r from-[#b01569] to-[#c82478] text-white'
                        : 'bg-[#1a1a1a] text-gray-200'
                    }`}
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: 'backwards',
                    }}
                  >
                    <div className="relative z-10 whitespace-pre-line text-sm sm:text-base">
                      {message.text}
                    </div>
                    {message.isUser && (
                      <div className="absolute inset-0 bg-gradient-to-r from-[#b01569] to-[#c82478] opacity-20 blur-xl rounded-2xl"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Chat input - Only show when showChatBar is true */}
      {showChatBar && (
        <div className="w-full p-2 sm:p-4 border-t border-gray-800 bg-[#0f0f0f] sticky bottom-0 z-10">
          <div className="mx-auto max-w-3xl w-full flex items-center bg-[#1a1a1a] rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-lg transform transition-all duration-300 hover:scale-[1.01] relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#b01569] to-[#c82478] opacity-0 group-hover:opacity-5 rounded-xl transition-opacity"></div>
            <button className="text-gray-400 hover:text-white transition-colors relative z-10">
              <Paperclip size={18} className="sm:w-5 sm:h-5" />
            </button>
            <input
              type="text"
              placeholder="Type a city name..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1 bg-transparent outline-none px-3 sm:px-4 text-sm sm:text-base placeholder-gray-500 text-white relative z-10 disabled:opacity-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className={`bg-gradient-to-r from-[#b01569] to-[#c82478] hover:from-[#c82478] hover:to-[#b01569] rounded-full p-1.5 sm:p-2 transition-all transform hover:scale-110 relative z-10 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <SendHorizonal size={18} className="text-white sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* Add this to your global CSS (e.g. styles/globals.css or in a <style jsx global>)
@keyframes fadein-slidein {
  0% { opacity: 0; transform: translateY(24px) scale(0.98); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
.animate-fadein-slidein {
  animation: fadein-slidein 0.4s cubic-bezier(0.4,0,0.2,1);
}
*/
