import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { socket } from '../socket';
import { setSubmitted } from '../features/pollSlice';
import { Container, Button, Card } from './Styled';
import styled, { keyframes } from 'styled-components';

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const OptionsGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
`;

const OptionButton = styled(Button)`
    background-color: #f0f0f0;
    color: #333;
    width: 100%;
    padding: 2rem;
    font-size: 1.2rem;
    &:hover { background-color: #e0e0e0; }
`;

const timerAnimation = keyframes`
  from { width: 100%; }
  to { width: 0%; }
`;

const TimerBar = styled.div`
  height: 10px;
  background-color: #007bff;
  animation: ${timerAnimation} 60s linear forwards;
`;

const ResultsContainer = styled.div`
    /* Same as TeacherView, can be extracted to a separate component */
    h3 { margin-top: 0; }
    .bar-container {
        margin-bottom: 10px;
        .bar-label { display: block; margin-bottom: 5px; }
        .bar {
            background-color: #e0e0e0;
            border-radius: 5px;
            .bar-fill {
                background-color: #4caf50;
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

function StudentView() {
    const dispatch = useDispatch();
    const { pollId, user, currentQuestion, results, hasSubmitted } = useSelector(state => state.poll);

    const handleAnswerSubmit = (option) => {
        socket.emit('student:submitAnswer', { pollId, answer: option });
        dispatch(setSubmitted());
    };

    const renderContent = () => {
        if (results) {
            return (
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
                </ResultsContainer>
            );
        }

        if (currentQuestion) {
            if (hasSubmitted) {
                return <h3>Waiting for other students to answer...</h3>;
            }
            return (
                <div>
                    <TimerBar key={currentQuestion.startTime} />
                    <h2>{currentQuestion.text}</h2>
                    <OptionsGrid>
                        {currentQuestion.options.map(opt => (
                            <OptionButton key={opt} onClick={() => handleAnswerSubmit(opt)}>
                                {opt}
                            </OptionButton>
                        ))}
                    </OptionsGrid>
                </div>
            );
        }

        return <h2>Waiting for the teacher to ask a question...</h2>;
    };

    return (
        <Container>
            <Header>
                <h1>Welcome, {user.name}!</h1>
                <p>Joined Poll: {pollId}</p>
            </Header>
            <Card>
                {renderContent()}
            </Card>
        </Container>
    );
}

export default StudentView;