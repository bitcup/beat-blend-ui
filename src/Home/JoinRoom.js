import React, {useState} from "react"
import {useNavigate} from "react-router-dom";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';

import axios from "axios";
import {Alert} from "react-bootstrap";

const JoinRoom = () => {
    const [name, setName] = useState("")
    const [room, setRoom] = useState("")
    const [errorMessage, setErrorMessage] = useState("")

    const navigate = useNavigate();

    const handleNameChange = (e) => {
        setName(e.target.value);
    };

    const handleRoomChange = (e) => {
        setRoom(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("before join room: name: " + name + ", room: " + room);
        axios.post("http://localhost:3001/rooms/" + room + "/join", {"name": name},
            {headers: {'Content-Type': 'application/json'}, withCredentials: true})
            // todo: catch error - room not found
            .then((res) => {
                navigate("/room/" + room)
            })
            .catch(function (error) {
                    if (error.response) {
                        if (error.response.status === 404) {
                            if (name === "" || room ==="") {
                                setErrorMessage("Please enter a guest name and a valid room.")
                            } else {
                                setErrorMessage("Room does not exist")
                            }
                            navigate("/");
                        }
                    }
                }
            );
    };

    return (
        // <small>
            <Card style={{width: '24rem'}}>
                {/*<Card.Img variant="top" src="holder.js/100px180" />*/}
                <Card.Body>
                    <Card.Title>Join Room</Card.Title>
                    <Card.Text>
                        <small>
                            Enter your name and room ID to join a room as a guest.
                        </small>
                    </Card.Text>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="joinRoomGuestName">
                            {/*<Form.Label>Guest name</Form.Label>*/}
                            <Form.Control type="text"
                                          placeholder="Guest name"
                                          value={name}
                                          onChange={handleNameChange}/>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="joinRoomRoomId">
                            {/*<Form.Label>Room</Form.Label>*/}
                            <Form.Control type="text"
                                          placeholder="Room"
                                          value={room}
                                          onChange={handleRoomChange}/>
                            {errorMessage &&
                                <span>
                                    <br/>
                                    <Alert key="danger" variant="danger">
                                        <i className="bi bi-exclamation-triangle"></i> {errorMessage}
                                    </Alert>
                                </span>
                            }
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Join Room
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        // </small>
    )
};

export default JoinRoom;
