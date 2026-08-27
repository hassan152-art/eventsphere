import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Send,
  Bot,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { aiService } from '../../services/userService';


const PROMPTS_BY_ROLE = {
  participant: [
    'Show upcoming events',
    'Which events have seats available?',
    'Show my registrations',
    'Show my certificates',
    'How does QR attendance work?',
  ],

  organizer: [
    'Show my upcoming events',
    'How many participants registered?',
    'Which event has the highest registrations?',
  ],

  admin: [
    'How many pending events are there?',
    'Summarize platform activity',
  ],
};


export default function CopilotWidget() {

  const {
    isAuthenticated,
    user,
  } = useAuth();

  const [open, setOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hi! I'm EventSphere Copilot. Ask me about events, registrations, attendance, or certificates.",
    },
  ]);

  const [input, setInput] = useState('');

  const [typing, setTyping] = useState(false);

  const scrollRef = useRef(null);


  useEffect(() => {

    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });

  }, [messages, typing]);


  if (!isAuthenticated) {
    return null;
  }


  const suggestedPrompts =
    PROMPTS_BY_ROLE[user?.role] ||
    PROMPTS_BY_ROLE.participant;


  const send = async (text) => {

    const content = (text ?? input).trim();

    if (!content || typing) {
      return;
    }


    /**
     * Send previous conversation to backend.
     */
    const history = messages
      .slice(-10)
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));


    /**
     * Add user's message immediately.
     */
    setMessages((current) => [
      ...current,
      {
        role: 'user',
        content,
      },
    ]);


    setInput('');

    setTyping(true);


    try {

      const response =
        await aiService.chat(
          content,
          history
        );


      const reply =
        response?.data?.reply ||
        "I couldn't generate a response right now.";


      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: reply,
        },
      ]);

    } catch (error) {

      console.error(
        'Copilot error:',
        error
      );


      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content:
            "I'm having trouble reaching the assistant service right now. Please try again shortly.",
        },
      ]);

    } finally {

      setTyping(false);

    }
  };


  return (
    <>
      {/* Floating button */}

      <motion.button
        onClick={() =>
          setOpen((value) => !value)
        }

        whileHover={{
          scale: 1.05,
        }}

        whileTap={{
          scale: 0.95,
        }}

        className="
          fixed
          bottom-6
          right-6
          z-50
          h-14
          w-14
          rounded-full
          bg-hero-gradient
          text-white
          shadow-glow
          grid
          place-items-center
        "

        aria-label="Open EventSphere Copilot"
      >

        <AnimatePresence mode="wait">

          {open ? (

            <motion.span
              key="close"
              initial={{
                rotate: -90,
                opacity: 0,
              }}
              animate={{
                rotate: 0,
                opacity: 1,
              }}
              exit={{
                rotate: 90,
                opacity: 0,
              }}
            >
              <X size={22} />
            </motion.span>

          ) : (

            <motion.span
              key="sparkle"
              initial={{
                rotate: 90,
                opacity: 0,
              }}
              animate={{
                rotate: 0,
                opacity: 1,
              }}
              exit={{
                rotate: -90,
                opacity: 0,
              }}
            >
              <Sparkles size={22} />
            </motion.span>

          )}

        </AnimatePresence>

      </motion.button>


      {/* Chat window */}

      <AnimatePresence>

        {open && (

          <motion.div
            initial={{
              opacity: 0,
              y: 24,
              scale: 0.95,
            }}

            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}

            exit={{
              opacity: 0,
              y: 24,
              scale: 0.95,
            }}

            className="
              fixed
              bottom-24
              right-6
              z-50
              w-[22rem]
              max-w-[90vw]
              h-[32rem]
              max-h-[75vh]
              card
              flex
              flex-col
              overflow-hidden
            "
          >

            {/* Header */}

            <div
              className="
                bg-hero-gradient
                text-white
                px-4
                py-3.5
                flex
                items-center
                gap-2
              "
            >

              <span
                className="
                  h-8
                  w-8
                  rounded-full
                  bg-white/20
                  grid
                  place-items-center
                "
              >
                <Bot size={16} />
              </span>


              <div>

                <p className="font-semibold text-sm">
                  EventSphere Copilot
                </p>

                <p className="text-[11px] text-white/80">
                  AI Event Assistant
                </p>

              </div>

            </div>


            {/* Messages */}

            <div
              ref={scrollRef}
              className="
                flex-1
                overflow-y-auto
                px-3
                py-3
                space-y-3
              "
            >

              {messages.map(
                (message, index) => (

                  <div
                    key={index}
                    className={`flex ${
                      message.role === 'user'
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >

                    <div
                      className={`
                        max-w-[85%]
                        px-3
                        py-2
                        rounded-2xl
                        text-sm
                        whitespace-pre-line

                        ${
                          message.role === 'user'
                            ? 'bg-brand-600 text-white rounded-br-sm'
                            : 'bg-slate-100 dark:bg-white/10 rounded-bl-sm'
                        }
                      `}
                    >
                      {message.content}
                    </div>

                  </div>

                )
              )}


              {/* Typing */}

              {typing && (

                <div className="flex justify-start">

                  <div
                    className="
                      bg-slate-100
                      dark:bg-white/10
                      px-3
                      py-2.5
                      rounded-2xl
                      rounded-bl-sm
                      flex
                      gap-1
                    "
                  >

                    {[0, 1, 2].map(
                      (index) => (

                        <motion.span
                          key={index}

                          className="
                            h-1.5
                            w-1.5
                            rounded-full
                            bg-slate-400
                          "

                          animate={{
                            opacity: [
                              0.3,
                              1,
                              0.3,
                            ],
                          }}

                          transition={{
                            repeat: Infinity,
                            duration: 1,
                            delay:
                              index * 0.15,
                          }}
                        />

                      )
                    )}

                  </div>

                </div>

              )}

            </div>


            {/* Suggestions */}

            {messages.length <= 1 && (

              <div
                className="
                  px-3
                  pb-2
                  flex
                  flex-wrap
                  gap-1.5
                "
              >

                {suggestedPrompts
                  .slice(0, 4)
                  .map((prompt) => (

                    <button
                      key={prompt}
                      onClick={() =>
                        send(prompt)
                      }

                      className="
                        text-[11px]
                        px-2.5
                        py-1.5
                        rounded-full
                        bg-brand-50
                        dark:bg-brand-900/30
                        text-brand-700
                        dark:text-brand-300
                        hover:bg-brand-100
                      "
                    >
                      {prompt}
                    </button>

                  ))}

              </div>

            )}


            {/* Input */}

            <form
              onSubmit={(event) => {
                event.preventDefault();
                send();
              }}

              className="
                p-3
                border-t
                border-slate-100
                dark:border-white/5
                flex
                gap-2
              "
            >

              <input
                value={input}

                onChange={(event) =>
                  setInput(event.target.value)
                }

                disabled={typing}

                placeholder={
                  typing
                    ? 'Copilot is thinking...'
                    : 'Ask about events...'
                }

                className="
                  input
                  !py-2
                  text-sm
                  flex-1
                "
              />


              <button
                type="submit"
                disabled={
                  typing ||
                  !input.trim()
                }

                className="
                  btn-primary
                  !px-3
                  !py-2
                  disabled:opacity-50
                "
              >
                <Send size={16} />
              </button>

            </form>

          </motion.div>

        )}

      </AnimatePresence>
    </>
  );
}