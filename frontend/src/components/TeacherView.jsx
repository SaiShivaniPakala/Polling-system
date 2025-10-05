import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { socket } from '../socket';
import { Container, Button, Input, Card } from './Styled';
import styled from 'styled-components';
import { clearResults } from '../features/pollSlice'; 

const Header = styled.div`
  background-color: #007bff;
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px 8px 0 0;
  h1 { margin: 0; font-size: 1.5rem; }
  p { margin: 0.25rem 0 0; opacity: 0.9; }
`;

const QuestionForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;
const OptionsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const StudentList = styled.ul`
  list-style-type: none;
  padding: 0;
  li {
    padding: 8px;
    border-bottom: 1px solid #eee;
    &:last-child { border-bottom: none; }
    span {
        color: ${props => (props.answered ? 'green' : 'gray')};
        font-weight: ${props => (props.answered ? 'bold' : 'normal')};
    }
  }
`;

const ResultsContainer = styled.div`
    h3 { margin-top: 0; }
    .bar-container {
        margin-bottom: 10px;
        .bar-label { display: block; margin-bottom: 5px; }
        .bar {
            background-color: #e0e0e0;
            border-radius: 5px;
            .bar-fill {
                background-color: #007bff;
                height: 25px;
                border-radius: 5px;
                text-align: right;
                color: white;
                line-height: 25px;
                padding-right: 10px;
            }
        }
    }
`;


function TeacherView() {
    const { pollId, students, currentQuestion, results } = useSelector(state => state.poll);
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);

    const dispatch = useDispatch();

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleAskQuestion = (e) => {
        e.preventDefault();
        const filledOptions = options.filter(opt => opt.trim() !== '');
        if (question && filledOptions.length >= 2) {
            socket.emit('teacher:askQuestion', { pollId, question, options: filledOptions });
            setQuestion('');
            setOptions(['', '', '', '']);
        }
    };

    const answeredCount = students.filter(s => s.answer).length;
    const allAnswered = students.length > 0 && answeredCount === students.length;

    return (
        <Container>
            <Header>
                <h1>Teacher Dashboard</h1>
                <p>Share Poll ID with students: <strong>{pollId}</strong></p>
            </Header>
            
            <Card>
                <h2>Students Connected ({students.length})</h2>
                <StudentList>
                    {students.map(student => (
                        <li key={student.id}>{student.name} - 
                            <span answered={!!student.answer}>
                                {currentQuestion ? (student.answer ? ' Answered' : ' Awaiting Answer') : ' Idle'}
                            </span>
                        </li>
                    ))}
                </StudentList>
            </Card>

            {!results && (
                <Card>
                    <h2>Ask a New Question</h2>
                    <QuestionForm onSubmit={handleAskQuestion}>
                        <Input 
                            type="text" 
                            placeholder="Type your question here"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                        />
                        <OptionsContainer>
                            {options.map((opt, i) => (
                                <Input 
                                    key={i}
                                    type="text"
                                    placeholder={`Option ${i + 1}`}
                                    value={opt}
                                    onChange={(e) => handleOptionChange(i, e.target.value)}
                                />
                            ))}
                        </OptionsContainer>
                        <Button type="submit" disabled={!!currentQuestion && !allAnswered}>
                            {currentQuestion ? 'Waiting for Answers...' : 'Ask Question'}
                        </Button>
                    </QuestionForm>
                </Card>
            )}

            {results && (
                <Card>
                    <ResultsContainer>
                        <h3>Results</h3>
                        {Object.entries(results).map(([option, count]) => {
                             const totalVotes = Object.values(results).reduce((sum, c) => sum + c, 0);
                             const percentage = totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(1) : 0;
                            return (
                                <div key={option} className="bar-container">
                                    <span className="bar-label">{option} ({count} votes)</span>
                                    <div className="bar">
                                        <div className="bar-fill" style={{width: `${percentage}%`}}>
                                            {percentage}%
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                        <Button onClick={() => dispatch(clearResults())}> {/*socket.emit('teacher:askQuestion', { pollId, question: null, options: [] })*/}
                            Ask Another Question
                        </Button>
                    </ResultsContainer>
                </Card>
            )}
        </Container>
    );
}

export default TeacherView;