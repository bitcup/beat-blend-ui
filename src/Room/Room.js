import React, {useEffect, useState} from "react"
import { useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";
import axios from "axios";
import TrackSearch from "./TrackSearch";
import Queue from "./Queue";
import useWebSocket from "react-use-websocket"
import RoomMessage from "./RoomMessage";
import Container from "react-bootstrap/Container";
import {Col, Row} from "react-bootstrap";
import NavInfo from "./NavInfo";
import Nav from "react-bootstrap/Nav";

const Room = () => {
    const [socketUrl] = useState('ws://localhost:3001/ws/events');
    const {
        sendJsonMessage,
        lastJsonMessage,
        // readyState
    } = useWebSocket(socketUrl, {
        // share=true lets other components use the same ws (if same url)
        share: true,
        shouldReconnect: () => true,
    });

    const [user, setUser] = useState(null)
    const [queue, setQueue] = useState(null)
    const [showSearch, setShowSearch] = useState(false)

    const navigate = useNavigate();

    // Run when a new WebSocket message is received (lastJsonMessage)
    useEffect(() => {
        if (user !== null && lastJsonMessage !== null && lastJsonMessage.room_id === user.room_id) {
            console.log("~~~~~~~ room: " + user.room_id +
                        " received event_type: " + lastJsonMessage.event_type +
                        ", intended for room: " + lastJsonMessage.room_id +
                        ", event: " + JSON.stringify(lastJsonMessage))
            axios.get("http://localhost:3001/rooms/" + user.room_id + "/queue",
                {headers: {'Content-Type': 'application/json'}, withCredentials: true})
                .then((res) => {
                    // console.log("inside room, got queue=" + JSON.stringify(res.data));
                    setQueue(res.data);
                });
        } else {
            console.log("~~~~~~~ ignoring event: " + JSON.stringify(lastJsonMessage))
        }
    }, [user, lastJsonMessage])

    useEffect(() => {
        const host_cookie = Cookies.get("bb-host");
        const guest_cookie = Cookies.get("bb-guest");
        // console.log("host_cookie=" + host_cookie + ", guest_cookie=" + guest_cookie);
        let user_cookie;
        if (host_cookie != null) {
            user_cookie = host_cookie;
        } else {
            if (guest_cookie != null) {
                user_cookie = guest_cookie;
            } else {
                console.warn("NO COOKIES");
            }
        }
        if (user_cookie != null) {
            const pieces = user_cookie.split(":");
            // const room_id = pieces[0];
            const user_id = pieces[1];
            axios.get("http://localhost:3001/users/" + user_id,
                {headers: {'Content-Type': 'application/json'}, withCredentials: true})
                .then((res) => {
                    console.log("inside room, got user: " + JSON.stringify(res.data));
                    setUser(res.data)
                    axios.get("http://localhost:3001/rooms/" + res.data.room_id + "/queue",
                        {headers: {'Content-Type': 'application/json'}, withCredentials: true})
                        .then((res) => {
                            console.log("inside room, got queue=" + JSON.stringify(res.data));
                            setQueue(res.data)
                        });
                })
                .catch(function (error) {
                        if (error.response) {
                            if (error.response.status === 404) {
                                navigate("/");
                            }
                        }
                    }
                );
        }
    }, []);

    const handleShowSearch = (e) => {
        e.preventDefault();
        setShowSearch(true)
    };

    const handleHideSearch = (e) => {
        e.preventDefault();
        setShowSearch(false)
    };

    function clearQueue() {
        console.log("clearQueue");
        axios.delete("http://localhost:3001/rooms/" + queue.room_id + "/queue",
            {headers: {'Content-Type': 'application/json'}, withCredentials: true})
            .then((res) => {
                // console.log("inside room, got queue=" + JSON.stringify(res.data));
                setQueue(res.data);
                sendJsonMessage({
                    event_type: "queue_cleared",
                    timestamp: Date.now(),
                    room_id: user.room_id,
                    user_name: user.name,
                })
            });
    }

    function deleteFromQueue(queueTrack) {
        // console.log("========== " + JSON.stringify(queueTrack));
        // console.log("========== " + queueTrack.user.role);
        axios.delete("http://localhost:3001/rooms/" + user.room_id + "/queue/track/" + queueTrack.uuid,
            {headers: {'Content-Type': 'application/json'}, withCredentials: true})
            .then((res) => {
                // console.log("track removed!");
                sendJsonMessage({
                    event_type: "track_removed",
                    timestamp: Date.now(),
                    room_id: user.room_id,
                    user_name: user.name,
                    track_name: queueTrack.title
                })
            });
    }


    return (
        <>
            <Container fluid>
                <NavInfo user={user}/>
                <Row>
                    <Col>
                        Messages: <RoomMessage user={user} lastJsonMessage={lastJsonMessage}/>
                    </Col>
                </Row>
                {showSearch &&
                    <Row>
                        <Col>
                            <TrackSearch sendJsonMessage={sendJsonMessage} user={user}/>
                        </Col>
                    </Row>
                }
                {!showSearch &&
                    <Row>
                        <Col>
                            <Queue queue={queue} user={user} deleteFromQueue={deleteFromQueue} clearQueue={clearQueue}/>
                        </Col>
                    </Row>
                }
                <Nav fill variant="underline" defaultActiveKey="linkPlaylist" className="fixed-bottom footer">
                    <Nav.Item>
                        <Nav.Link eventKey="linkPlaylist" onClick={handleHideSearch}>
                            <i className="bi bi-music-note-list"></i> Playlist
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="linkSearch" onClick={handleShowSearch}>
                            <i className="bi bi-search"></i> Search
                        </Nav.Link>
                    </Nav.Item>
                </Nav>
            </Container>
        </>
    );
};
export default Room;
