import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  pollId: null,
  user: {
    isTeacher: false,
    name: null,
  },
  currentQuestion: null,
  students: [],
  results: null,
  hasSubmitted: false,
  error: null,
};

const pollSlice = createSlice({
  name: 'poll',
  initialState,
  reducers: {
    setPollId: (state, action) => {
      state.pollId = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setPollState: (state, action) => {
      state.currentQuestion = action.payload.question;
      state.students = action.payload.students;
      state.results = action.payload.results;
      state.hasSubmitted = false;
    },
    updateStudents: (state, action) => {
      state.students = action.payload;
    },
    setQuestion: (state, action) => {
      state.currentQuestion = action.payload;
      state.results = null;
      state.hasSubmitted = false;
    },
    setResults: (state, action) => {
      state.currentQuestion = null; // Question is over
      state.results = action.payload;
    },
    setSubmitted: (state) => {
      state.hasSubmitted = true;
    },
    setError: (state, action) => {
        state.error = action.payload;
    },
    clearResults: (state) => {
      state.results = null;
    },
    clearPoll: () => initialState,
  },
});

export const {
  setPollId,
  setUser,
  setPollState,
  updateStudents,
  setQuestion,
  setResults,
  setSubmitted,
  setError,
  clearResults,
  clearPoll
} = pollSlice.actions;

export default pollSlice.reducer;