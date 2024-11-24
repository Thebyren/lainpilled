import React, { useEffect, useState, useRef } from "react";
import "./AudioPlayer.css";

const AudioPlayer = () => {
    const [songs, setSongs] = useState([]); // Lista de canciones obtenidas de la API
    const [currentSong, setCurrentSong] = useState(null); // Canción actualmente reproduciéndose
    const [currentTime, setCurrentTime] = useState(0); // Tiempo actual de la canción
    const [duration, setDuration] = useState(0); // Duración total de la canción
    const [loading, setLoading] = useState(false);

    const audioRefs = useRef({}); // Referencias a los elementos de audio

    const fetchSongs = async () => {
        setLoading(true);
        const githubApiUrl = `https://api.github.com/repos/primalxaxa/lainwebsite/contents/music`;
        try {
            const response = await fetch(githubApiUrl);
            const data = await response.json();
            setSongs(data);
        } catch (error) {
            console.error("Error fetching songs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlayPause = (songUrl) => {
        if (currentSong !== songUrl) {
            // Pausar la canción anterior
            if (currentSong) {
                const prevAudio = audioRefs.current[currentSong];
                if (prevAudio) {
                    prevAudio.pause();
                }
            }

            // Reproducir la nueva canción
            setCurrentSong(songUrl);
            const newAudio = audioRefs.current[songUrl];
            if (newAudio) {
                setDuration(newAudio.duration || 0); // Actualizar la duración
                newAudio.play();
            }
        } else {
            // Pausar o reanudar la canción actual
            const currentAudio = audioRefs.current[songUrl];
            if (currentAudio) {
                if (currentAudio.paused) {
                    currentAudio.play();
                } else {
                    currentAudio.pause();
                }
            }
        }
    };

    const handleVolumeChange = (songUrl, volume) => {
        const audio = audioRefs.current[songUrl];
        if (audio) {
            audio.volume = volume;
        }
    };

    const handleTimeUpdate = () => {
        const audio = audioRefs.current[currentSong];
        if (audio) {
            setCurrentTime(audio.currentTime); // Actualizar el tiempo actual
        }
    };

    const handleSeek = (newTime) => {
        const audio = audioRefs.current[currentSong];
        if (audio) {
            audio.currentTime = newTime; // Cambiar al nuevo tiempo
            setCurrentTime(newTime); // Actualizar el estado
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    };

    useEffect(() => {
        fetchSongs();
    }, []);

    return (
        <div>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="audio-player">
                    {songs.map((song, index) => (
                        <div key={index} className="audio-item">
                            <span>{song.name}</span>
                            <audio
                                ref={(el) => (audioRefs.current[song.download_url] = el)}
                                src={song.download_url}
                                onTimeUpdate={handleTimeUpdate} // Escucha del progreso
                                onLoadedMetadata={(e) =>
                                    setDuration(e.target.duration)
                                } // Configura la duración
                                onEnded={() => setCurrentSong(null)}
                            />
                            <button
                                onClick={() => handlePlayPause(song.download_url)}
                            >
                                {currentSong === song.download_url &&
                                !audioRefs.current[song.download_url]?.paused
                                    ? "Pause"
                                    : "Play"}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                defaultValue="1"
                                onChange={(e) =>
                                    handleVolumeChange(song.download_url, e.target.value)
                                }
                            />
                            {currentSong === song.download_url && (
                                <div className="time-controls">
                                    <span>{formatTime(currentTime)}</span>
                                    <input
                                        type="range"
                                        min="0"
                                        max={duration}
                                        step="0.1"
                                        value={currentTime}
                                        onChange={(e) => handleSeek(e.target.value)}
                                    />
                                    <span>{formatTime(duration - currentTime)}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AudioPlayer;
