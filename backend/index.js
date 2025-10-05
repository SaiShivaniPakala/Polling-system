console.log("STARTING BACKEND...");


const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { nanoid } = require('nanoid');

const app = express();
app.use(cors());
const server = http.createServer(app);

// Configure Socket.io with CORS settings
const io = new Server(server, {
  cors: {
    origin: "https://polling-system-ochre-eight.vercel.app", // The origin of your React frontend
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 4000;

// This object will store the state of all active polls in memory
let polls = {};

// -- Helper Functions --
const calculateResults = (pollId) => {
    const poll = polls[pollId];
    if (!poll || !poll.question) return;

    const results = {};
    poll.question.options.forEach(option => {
        results[option] = 0;
    });

    Object.values(poll.students).forEach(student => {
        if (student.answer) {
            results[student.answer]++;
        }
    });
    return results;
};

const endQuestionAndShowResults = (pollId) => {
    const poll = polls[pollId];
    if (!poll) return;

    // Clear any existing timer to prevent it from running again
    // MODIFICATION: Check for poll.timer instead of poll.question.timer
    if (poll.timer) {
        clearTimeout(poll.timer);
        poll.timer = null; // Clear the timer handle
    }
    
    poll.results = calculateResults(pollId);
    // When we show results, also clear the current question from the main state
    poll.question = null; 
    io.to(pollId).emit('server:showResults', poll.results);
};

// -- Socket.io Event Handlers --
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // === Teacher Events ===
    socket.on('teacher:createPoll', () => {
        const pollId = nanoid(5).toUpperCase();
        polls[pollId] = {
            teacherSocketId: socket.id,
            question: null,
            students: {},
            results: null,
        };
        socket.join(pollId);
        console.log(`Teacher ${socket.id} created and joined poll ${pollId}`);
        socket.emit('server:pollCreated', { pollId });
    });

    socket.on('teacher:askQuestion', ({ pollId, question, options }) => {
        const poll = polls[pollId];
        if (!poll || poll.teacherSocketId !== socket.id) return;
    
        // Reset previous answers and results
        Object.values(poll.students).forEach(student => student.answer = null);
        poll.results = null;
    
        // MODIFICATION: Store the timer on the poll object, NOT the question object
        if (poll.timer) clearTimeout(poll.timer); // Clear any lingering timer
        poll.timer = setTimeout(() => endQuestionAndShowResults(pollId), 60000);
    
        // Create a CLEAN question object to send to the client
        const questionData = {
            text: question,
            options,
            startTime: Date.now()
        };
    
        // Store the clean question data in our state
        poll.question = questionData;
    
        console.log(`Poll ${pollId}: New question asked.`);
        
        // Send ONLY the clean data object to the client
        io.to(pollId).emit('server:newQuestion', questionData);
        io.to(pollId).emit('server:studentsUpdated', Object.values(poll.students));
    });
    // === Student Events ===
    socket.on('student:joinPoll', ({ pollId, name }) => {
        const poll = polls[pollId];
        if (!poll) {
            socket.emit('server:error', { message: 'Poll not found.' });
            return;
        }

        socket.join(pollId);
        poll.students[socket.id] = { id: socket.id, name, answer: null };
        console.log(`Student ${name} (${socket.id}) joined poll ${pollId}`);

        // Send current poll state to the newly joined student
        socket.emit('server:pollState', {
            question: poll.question,
            students: Object.values(poll.students),
            results: poll.results
        });

        // Inform everyone in the room about the updated student list
        io.to(pollId).emit('server:studentsUpdated', Object.values(poll.students));
    });

    socket.on('student:submitAnswer', ({ pollId, answer }) => {
        const poll = polls[pollId];
        if (!poll || !poll.students[socket.id] || !poll.question) return;

        poll.students[socket.id].answer = answer;
        console.log(`Student ${poll.students[socket.id].name} answered: ${answer}`);

        // Inform teacher about the live submission count
        io.to(poll.teacherSocketId).emit('server:studentsUpdated', Object.values(poll.students));

        // Check if all students have answered
        const allAnswered = Object.values(poll.students).every(student => student.answer !== null);
        if (allAnswered) {
            endQuestionAndShowResults(pollId);
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        // Find which poll the user was in and remove them
        for (const pollId in polls) {
            const poll = polls[pollId];
            if (poll.students[socket.id]) {
                delete poll.students[socket.id];
                io.to(pollId).emit('server:studentsUpdated', Object.values(poll.students));
                console.log(`Removed student ${socket.id} from poll ${pollId}`);
                break;
            }
            if (poll.teacherSocketId === socket.id) {
                // For simplicity, we just delete the poll if the teacher leaves.
                // A more robust solution might be to transfer ownership or allow reconnection.
                delete polls[pollId];
                io.to(pollId).emit('server:error', { message: 'The teacher has ended the poll.' });
                console.log(`Teacher disconnected. Poll ${pollId} closed.`);
                break;
            }
        }
    });
});

server.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));   
