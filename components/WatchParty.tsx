'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiCopy, FiCheck, FiX, FiSend } from 'react-icons/fi';
import { io, Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

interface Props {
  movieId: string;
  onSocketReady: (socket: Socket, isHost: boolean) => void;
}

export default function WatchParty({ movieId, onSocketReady }: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'idle' | 'hosting' | 'joining'>('idle');
  const [roomId, setRoomId] = useState('');
  const [joinInput, setJoinInput] = useState('');
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
  const [messages, setMessages] = useState<{ userName: string; message: string; time: number }[]>([]);
  const [msgInput, setMsgInput] = useState('');
  const [userName] = useState(() => `Guest_${Math.floor(Math.random()*9999)}`);
  const [copied, setCopied] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const connect = (isHost: boolean, rid: string) => {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const socket = io(url);
    socketRef.current = socket;

    socket.on('connect', () => {
      if (isHost) socket.emit('party:create', { roomId: rid, movieId, userName });
      else socket.emit('party:join', { roomId: rid, userName });
      onSocketReady(socket, isHost);
    });

    socket.on('party:created', () => { setMode('hosting'); toast.success('Party room created!'); });
    socket.on('party:joined', ({ members }: any) => { setMode('joining'); setMembers(members); });
    socket.on('party:memberUpdate', ({ members }: any) => setMembers(members));
    socket.on('party:error', ({ message }: any) => toast.error(message));
    socket.on('party:message', (msg: any) => {
      setMessages(prev => [...prev, msg]);
      setTimeout(() => chatRef.current?.scrollTo(0, chatRef.current.scrollHeight), 50);
    });

    return socket;
  };

  const createParty = () => {
    const rid = uuidv4().slice(0, 8).toUpperCase();
    setRoomId(rid);
    connect(true, rid);
  };

  const joinParty = () => {
    if (!joinInput.trim()) return;
    const rid = joinInput.trim().toUpperCase();
    setRoomId(rid);
    connect(false, rid);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.href}?party=${roomId}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
    toast.success('Party link copied!');
  };

  const sendMessage = () => {
    if (!msgInput.trim() || !socketRef.current) return;
    socketRef.current.emit('party:message', { roomId, userName, message: msgInput });
    setMsgInput('');
  };

  const leave = () => {
    socketRef.current?.disconnect();
    setMode('idle'); setRoomId(''); setMembers([]); setMessages([]);
    setOpen(false);
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-nova-border text-sm font-medium hover:border-nova-accent/50 transition-colors"
      >
        <FiUsers size={16} className="text-nova-accent" />
        Watch Party
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 24 }}
              className="glass border border-nova-border rounded-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <FiUsers className="text-nova-accent" /> Watch Party
                </h3>
                <button onClick={leave} className="text-nova-muted hover:text-white"><FiX /></button>
              </div>

              {mode === 'idle' ? (
                <div className="flex flex-col gap-4">
                  <motion.button whileHover={{ scale: 1.02 }} onClick={createParty}
                    className="w-full py-3 bg-nova-accent hover:bg-nova-accent-hover text-white rounded-xl font-semibold transition-colors">
                    Create Party Room
                  </motion.button>
                  <div className="flex gap-2">
                    <input value={joinInput} onChange={e => setJoinInput(e.target.value)}
                      placeholder="Enter Room ID"
                      className="flex-1 bg-nova-border/40 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-nova-accent/60 border border-transparent transition-colors"
                    />
                    <button onClick={joinParty}
                      className="px-4 py-2.5 bg-nova-card border border-nova-border rounded-xl text-sm hover:border-nova-accent/50 transition-colors">
                      Join
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Room info */}
                  <div className="bg-nova-card rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-nova-muted">Room ID</p>
                      <p className="font-mono font-bold text-nova-accent">{roomId}</p>
                    </div>
                    <button onClick={copyLink} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-nova-border rounded-lg hover:bg-nova-border/70 transition-colors">
                      {copied ? <FiCheck className="text-green-400" /> : <FiCopy />}
                      {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>
                  {/* Members */}
                  <div className="flex flex-wrap gap-2">
                    {members.map(m => (
                      <span key={m.id} className="text-xs px-2.5 py-1 bg-nova-accent/10 text-nova-accent border border-nova-accent/20 rounded-full">{m.name}</span>
                    ))}
                  </div>
                  {/* Chat */}
                  <div ref={chatRef} className="h-36 overflow-y-auto flex flex-col gap-2 pr-1">
                    {messages.map((m, i) => (
                      <div key={i} className="text-xs">
                        <span className="text-nova-accent font-semibold">{m.userName}:</span>{' '}
                        <span className="text-nova-text">{m.message}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={msgInput} onChange={e => setMsgInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendMessage()}
                      placeholder="Send a message..."
                      className="flex-1 bg-nova-border/40 rounded-xl px-3 py-2 text-sm outline-none border border-transparent focus:border-nova-accent/60 transition-colors"
                    />
                    <button onClick={sendMessage}
                      className="w-9 h-9 bg-nova-accent rounded-xl flex items-center justify-center text-white hover:bg-nova-accent-hover transition-colors">
                      <FiSend size={14} />
                    </button>
                  </div>
                  <button onClick={leave} className="text-xs text-nova-muted hover:text-nova-accent transition-colors text-center">Leave Party</button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
