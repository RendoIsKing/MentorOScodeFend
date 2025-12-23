import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Send, LayoutDashboard, X, ChevronDown, ArrowLeft } from 'lucide-react';
import { WeighInCard } from './widgets/WeighInCard';
import { WorkoutCard } from './widgets/WorkoutCard';
import { InteractiveWorkoutWidget } from './widgets/InteractiveWorkoutWidget';
import { MealsCarouselCard } from './widgets/MealsCarouselCard';
// NOTE: the Figma export used a Vite-only `figma:asset/*` import. Replace with a stable public asset.
const coachImage = '/assets/images/Home/small-profile-img.svg';
import type { Message } from '../types';

interface MessageWithSlide extends Message {
  currentMealSlide?: number; // Track which meal card is currently visible
}

interface ChatInterfaceProps {
  coachName: string;
  isStudentCenterOpen: boolean;
  onToggleStudentCenter: () => void;
  isMobile?: boolean;
  onWeighIn?: (data: { weight: number; date: Date; condition: string; notes?: string }) => void;
  messages?: MessageWithSlide[];
  setMessages?: React.Dispatch<React.SetStateAction<MessageWithSlide[]>>;
  // Optional: wire to real backend chat. If provided, ChatInterface will not simulate coach replies.
  onSendText?: (text: string) => Promise<void> | void;
  onWorkoutComplete?: (workoutId: string, completedWorkout: any, progress: any) => void;
  todaysWorkout?: any;
  todaysMeals?: any[];
  onMealComplete?: (mealId: number, completed: boolean) => void;
  onNavigateBack?: () => void;
  onShareWidget?: (widgetType: string, widgetData: any) => void;
}

export function ChatInterface({ coachName, isStudentCenterOpen, onToggleStudentCenter, isMobile, onWeighIn, messages, setMessages, onSendText, onWorkoutComplete, todaysWorkout, todaysMeals, onMealComplete, onNavigateBack, onShareWidget }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim()) {
      const newMessage: MessageWithSlide = {
        id: Date.now().toString(),
        text: inputValue,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
      try { onSendText?.(String(inputValue || '').trim()); } catch {}
      setInputValue('');
      // If onSendText is provided, we rely on the outer container to poll/stream coach replies.
      if (!onSendText) {
        // Simulate coach response
        setTimeout(() => {
          const responses = [
            "That's great! I'm here to support you every step of the way.",
            "Perfect! Let me update your Student Center with that information.",
            "I've noted that down. Your plan is being adjusted accordingly.",
            "Excellent progress! Keep up the great work!",
          ];
          const coachMessage: MessageWithSlide = {
            id: (Date.now() + 1).toString(),
            text: responses[Math.floor(Math.random() * responses.length)],
            sender: 'coach',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, coachMessage]);
        }, 1000);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (action: 'weigh-in' | 'today-workout' | 'today-meals') => {
    const timestamp = new Date();
    
    if (action === 'weigh-in') {
      const coachMessage: Message = {
        id: Date.now().toString(),
        text: "Let's log your weight for today! 📊",
        sender: 'coach',
        timestamp: timestamp,
        widget: 'weigh-in',
      };
      setMessages((prev) => [...prev, coachMessage]);
    } else if (action === 'today-workout') {
      // Get today's workout data
      const todayWorkout = todaysWorkout;
      
      const coachMessage: Message = {
        id: Date.now().toString(),
        text: "Here's your workout for today! Let's crush it! 💪",
        sender: 'coach',
        timestamp: timestamp,
        widget: 'today-workout',
        workoutData: todayWorkout,
      };
      setMessages((prev) => [...prev, coachMessage]);
    } else if (action === 'today-meals') {
      // Get today's meals data
      const todayMeals = todaysMeals;
      
      const coachMessage: Message = {
        id: Date.now().toString(),
        text: "Here's your meal plan for today! Let's stay on track! 🍽️",
        sender: 'coach',
        timestamp: timestamp,
        widget: 'today-meals',
        mealsData: todayMeals,
      };
      setMessages((prev) => [...prev, coachMessage]);
    }
  };

  const handleWeighIn = (data: { weight: number; date: Date; condition: string; notes?: string }, messageId: string) => {
    // Update the message with the submitted data
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, submittedWeighInData: data }
          : msg
      )
    );

    // Add a confirmation message from the user
    const userMessage: Message = {
      id: Date.now().toString(),
      text: `Logged weight: ${data.weight} kg`,
      sender: 'user',
      timestamp: new Date(),
    };
    
    // Add coach response
    setTimeout(() => {
      const coachMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Great! I've updated your weight progress. Keep up the good work! 🎉",
        sender: 'coach',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage, coachMessage]);
    }, 500);

    // Call the onWeighIn callback if provided
    if (onWeighIn) {
      onWeighIn(data);
    }
  };

  return (
    <div className="h-full flex flex-col bg-sidebar overflow-hidden max-w-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border bg-sidebar flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 flex-shrink-0 hover:bg-sidebar-accent border border-sidebar-border"
            onClick={onNavigateBack}
          >
            <ArrowLeft className="h-5 w-5 text-sidebar-foreground" />
          </Button>
          
          <Avatar className="h-9 w-9 border border-sidebar-primary/10">
            <AvatarImage src={coachImage} alt={`${coachName}'s avatar`} />
            <AvatarFallback className="bg-sidebar-primary/20 text-sidebar-primary">
              {coachName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          {(!isStudentCenterOpen || isMobile) && (
            <div className="min-w-0">
              <p className="text-sidebar-foreground truncate">{coachName}</p>
              <p className="text-xs text-sidebar-foreground/60">Your AI Fitness Coach</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Quick Actions Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="default"
              onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
              className="flex-shrink-0 border-gray-300 bg-white hover:bg-gray-50 text-gray-900"
              style={{ color: '#1F2937' }}
            >
              <span>Quick Actions</span>
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
            
            {isQuickActionsOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsQuickActionsOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-50">
                  <button
                    onClick={() => {
                      handleQuickAction('weigh-in');
                      setIsQuickActionsOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 rounded-t-md"
                    style={{ color: '#1F2937' }}
                  >
                    <span>📊</span>
                    Weigh In
                  </button>
                  <button
                    onClick={() => {
                      handleQuickAction('today-workout');
                      setIsQuickActionsOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                    style={{ color: '#1F2937' }}
                  >
                    <span>💪</span>
                    Today's Training
                  </button>
                  <button
                    onClick={() => {
                      handleQuickAction('today-meals');
                      setIsQuickActionsOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 rounded-b-md"
                    style={{ color: '#1F2937' }}
                  >
                    <span>🍽️</span>
                    Today's Meals
                  </button>
                </div>
              </>
            )}
          </div>

          {!isMobile && (
            <Button
              onClick={onToggleStudentCenter}
              size={isStudentCenterOpen ? "icon" : "default"}
              variant="outline"
              className="flex-shrink-0 border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              {isStudentCenterOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <>
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  <span>Student Center</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="px-3 sm:px-4 py-4 max-w-full">
            <div className="space-y-4 max-w-full">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'} max-w-full`}
                >
                  {message.sender === 'coach' && !isStudentCenterOpen && !(isMobile && message.widget) && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={coachImage} alt={`${coachName}'s avatar`} />
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                        {coachName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`flex flex-col gap-2 min-w-0 ${message.widget ? 'w-full max-w-[calc(100vw-1.5rem)] sm:max-w-full' : 'max-w-[85%]'}`}>
                    {message.text && (
                      <div
                        className={`rounded-2xl px-4 py-2.5 ${
                          message.sender === 'user'
                            ? 'bg-[#0078D7] text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="break-words text-sm leading-relaxed">{message.text}</p>
                        <span className={`text-xs mt-1.5 block ${
                          message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                    
                    {/* Render widgets */}
                    {message.widget === 'weigh-in' && (
                      <WeighInCard
                        onSubmit={(data) => handleWeighIn(data, message.id)}
                        submittedData={message.submittedWeighInData}
                        onShare={(data) => {
                          // Share this widget - use passed data if available, otherwise use submitted data or defaults
                          const shareData = data || message.submittedWeighInData || {
                            weight: 0,
                            date: new Date(),
                            condition: 'morning-fasted'
                          };
                          onShareWidget && onShareWidget('weigh-in', shareData);
                        }}
                      />
                    )}
                    
                    {message.widget === 'today-workout' && message.workoutData && (
                      <div className="w-full">
                        <InteractiveWorkoutWidget
                          workout={message.workoutData}
                          progress={message.workoutProgress}
                          onProgressUpdate={(progress) => {
                            setMessages((prev) =>
                              prev.map((msg) =>
                                msg.id === message.id
                                  ? { ...msg, workoutProgress: progress }
                                  : msg
                              )
                            );
                          }}
                          onComplete={(completedWorkout, progress) => {
                            console.log('InteractiveWorkoutWidget onComplete called:', completedWorkout.id, completedWorkout, progress);
                            
                            // Update message with completion
                            setMessages((prev) =>
                              prev.map((msg) =>
                                msg.id === message.id
                                  ? { 
                                      ...msg, 
                                      workoutData: completedWorkout,
                                      workoutProgress: progress 
                                    }
                                  : msg
                              )
                            );

                            // Add coach celebration message
                            setTimeout(() => {
                              const coachMessage: Message = {
                                id: (Date.now() + 1).toString(),
                                text: `Amazing work! You crushed ${completedWorkout.name}! 🎉💪 Your progress is being updated in your Training section.`,
                                sender: 'coach',
                                timestamp: new Date(),
                              };
                              setMessages((prev) => [...prev, coachMessage]);
                            }, 500);

                            // Call the onWorkoutComplete callback if provided
                            if (onWorkoutComplete) {
                              console.log('Calling onWorkoutComplete with:', completedWorkout.id, completedWorkout, progress);
                              onWorkoutComplete(completedWorkout.id, completedWorkout, progress);
                            } else {
                              console.warn('onWorkoutComplete is not defined!');
                            }
                          }}
                          onShare={(workout, progress) => {
                            // Share this widget with workout data
                            onShareWidget && onShareWidget('today-workout', {
                              workout,
                              progress
                            });
                          }}
                        />
                      </div>
                    )}
                    
                    {message.widget === 'today-meals' && message.mealsData && (
                      <div className="w-full overflow-hidden">
                        <MealsCarouselCard
                          meals={message.mealsData}
                          initialSlide={message.currentMealSlide || 0}
                          onSlideChange={(slideIndex) => {
                            // Save current slide position
                            setMessages((prev) =>
                              prev.map((msg) =>
                                msg.id === message.id
                                  ? { ...msg, currentMealSlide: slideIndex }
                                  : msg
                              )
                            );
                          }}
                          onMealComplete={(mealId, completed) => {
                            // Update the meal completion state in messages
                            setMessages((prev) =>
                              prev.map((msg) =>
                                msg.id === message.id
                                  ? {
                                      ...msg,
                                      mealsData: msg.mealsData?.map((meal) =>
                                        meal.id === mealId
                                          ? { ...meal, completed }
                                          : meal
                                      ),
                                    }
                                  : msg
                              )
                            );
                            
                            // Call the parent callback if provided
                            onMealComplete?.(mealId, completed);
                          }}
                          onShare={(data) => {
                            // Share this widget with meals data and current slide
                            onShareWidget && onShareWidget('today-meals', data);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="border-t border-sidebar-border p-4 bg-sidebar-accent flex-shrink-0">
        <div className="flex gap-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask your coach anything..."
            className="min-h-[44px] max-h-[120px] resize-none bg-sidebar border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/40"
            rows={1}
          />
          <Button 
            onClick={handleSend} 
            size="icon"
            className="h-11 w-11 bg-sidebar-primary hover:bg-sidebar-primary/80 text-sidebar-primary-foreground"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}