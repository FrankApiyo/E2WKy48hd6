import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AppBar,
  Toolbar,
  Button,
  Modal,
  Card,
  CardContent,
  Input,
  TextField,
  IconButton,
  Grid,
  Typography,
  Box,
  Fab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PushPinIcon from '@mui/icons-material/PushPin';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const API_URL = 'http://localhost:8000';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [notes, setNotes] = useState([]);
  const [showLogin, setShowLogin] = useState(!token);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pinned, setPinned] = useState(false);
  const [noteId, setNoteId] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (token) fetchNotes();
  }, [token]);

  const fetchNotes = async () => {
    try {
      const response = await axios.get(`${API_URL}/notes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(response.data);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    }
  };

  const handleLogin = async () => {
    try {
      localStorage.setItem('token', username);
      setToken(username);
      setShowLogin(false);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setShowLogin(true);
  };

  const handleSaveNote = async ({ note_id, pinned, title, content }) => {
    try {
      const url = noteId ? `${API_URL}/notes/${note_id}` : `${API_URL}/notes`;
      const method = noteId ? 'put' : 'post';

      const formData = new FormData();
      if (title) formData.append('title', title);
      if (content) formData.append('content', content);
      if (pinned !== undefined) formData.append('pinned', String(pinned));
      console.log(formData)
      console.log(method)

      await axios[method](url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });
      setShowNoteModal(false);
      fetchNotes();
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await axios.delete(`${API_URL}/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotes();
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleEditNote = (note) => {
    setTitle(note.title);
    setContent(note.content);
    setPinned(note.pinned);
    setNoteId(note.id);
    setShowNoteModal(true);
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Notes App</Typography>
          {token && <Button color="inherit" onClick={handleLogout}>Logout</Button>}
        </Toolbar>
      </AppBar>

      <Grid container spacing={2} padding={2}>
        {notes.map(note => (
          <Grid item xs={12} md={6} lg={4} key={note.id}>
            <Card style={{ backgroundColor: note.pinned ? '#ffeb3b' : '#ffffff' }}>
              <CardContent>
                <Typography variant="h5">{note.title}</Typography>
                <Typography variant="body2">{note.content.substring(0, 100)}...</Typography>
                <IconButton onClick={() => handleEditNote(note)}><EditIcon /></IconButton>
                <IconButton onClick={() => handleDeleteNote(note.id)}><DeleteIcon /></IconButton>
                <IconButton onClick={() => handleSaveNote({ title: note.title, content: note.content, note_id: note.id, pinned: !note.pinned })}>
                  <PushPinIcon color={note.pinned ? 'primary' : 'inherit'} />
                </IconButton>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Fab color="primary" onClick={() => { setShowNoteModal(true); setNoteId(null) }} style={{ position: 'fixed', bottom: 20, right: 20 }}>
        <AddIcon />
      </Fab>

      <Modal open={showNoteModal} onClose={() => setShowNoteModal(false)}>
        <Box style={{ padding: 20, backgroundColor: 'white', margin: '10% auto', width: '50%' }}>
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
          <TextField placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} fullWidth rows={4} />
          <Button variant="contained" onClick={() => handleSaveNote({ title: title, content: content, pinned: pinned, note_id: noteId })}>Save Note</Button>
        </Box>
      </Modal>

      <Modal open={showLogin} onClose={() => { }}>
        <Box style={{ padding: 20, backgroundColor: 'white', margin: '10% auto', width: '30%' }}>
          <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} fullWidth />
          <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth />
          <Button variant="contained" onClick={handleLogin}>Login</Button>
        </Box>
      </Modal>
    </Box>
  );
}

