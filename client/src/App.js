import "bootstrap/dist/css/bootstrap.min.css"
import MusicDashBoard from "./MusicDashBoard";

// const spotifyAccessToken = new URLSearchParams(window.location.search).get("access_token");
// const linkThing = new URLSearchParams(window.location);
// let whichService;
//
// if (linkThing.toString().includes("google")) {
//     whichService = "Youtube";
// } else {
//     whichService = "Spotify";
// }


function App() {
    // return <OldDashboard code={spotifyAccessToken} whichService={whichService}/>
    // return <SpotifyDashBoard code={spotifyAccessToken}/>
    return <MusicDashBoard />
}

export default App
