import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle } from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
}

interface LiveChatProps {
  sessionId: string;
  userId: string;
  userName: string;
}

export function LiveChat({ sessionId, userId, userName }: LiveChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/chat`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      setIsConnected(true);
      // Join session chat room
      websocket.send(JSON.stringify({
        type: 'join',
        sessionId,
        userId,
        userName
      }));
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'message' && data.sessionId === sessionId) {
        setMessages(prev => [...prev, {
          id: data.id || Math.random().toString(),
          sessionId: data.sessionId,
          userId: data.userId,
          userName: data.userName,
          message: data.message,
          timestamp: new Date(data.timestamp)
        }]);
      } else if (data.type === 'user_joined') {
        // Handle user joined notification
        console.log(`${data.userName} joined the session`);
      } else if (data.type === 'user_left') {
        // Handle user left notification
        console.log(`${data.userName} left the session`);
      }
    };

    websocket.onclose = () => {
      setIsConnected(false);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    setWs(websocket);

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({
          type: 'leave'
        }));
      }
      websocket.close();
    };
  }, [sessionId, userId, userName]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !ws || !isConnected) return;

    ws.send(JSON.stringify({
      type: 'message',
      sessionId,
      userId,
      userName,
      message: newMessage,
      timestamp: new Date().toISOString()
    }));

    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Live Chat
          </CardTitle>
          <div className={`flex items-center gap-2 text-sm ${isConnected ? 'text-chart-3' : 'text-muted-foreground'}`}>
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-chart-3' : 'bg-muted-foreground'}`} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col gap-1 ${
                    msg.userId === userId ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium">{msg.userName}</span>
                    <span>{format(msg.timestamp, 'h:mm a')}</span>
                  </div>
                  <div
                    className={`max-w-[80%] rounded-md px-3 py-2 ${
                      msg.userId === userId
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={!isConnected}
            data-testid="input-chat-message"
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !isConnected}
            data-testid="button-send-message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
