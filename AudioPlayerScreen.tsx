/**
 * AudioPlayerScreen - Main UI component for the MP3 player
 * Demonstrates React Native + Native Module integration with real-time progress tracking
 */

import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Button,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Alert,
  TextInput,
  TouchableWithoutFeedback,
  TouchableOpacity,
  GestureResponderEvent,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AudioPlayer from './AudioPlayerModule';

const DOWNLOAD_FOLDER = '/sdcard/Download/';
const PROGRESS_UPDATE_INTERVAL = 500;

const AudioPlayerScreen: React.FC = () => {
  const [status, setStatus] = useState('Ready');
  const [error, setError] = useState('');
  const [hasPermission, setHasPermission] = useState(false);
  const [fileName, setFileName] = useState('test.mp3');
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const getFullPath = (name: string): string => {
    return name.includes('/') ? name : DOWNLOAD_FOLDER + name;
  };

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getDisplayName = (name: string): string => {
    return name.split('/').pop() || name;
  };

  // Request audio permissions on mount
  useEffect(() => {
    const timer = setTimeout(requestPermissions, 100);
    return () => {
      clearTimeout(timer);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  // Update progress bar while playing
  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(async () => {
        try {
          const [pos, dur] = await Promise.all([
            AudioPlayer.getCurrentPosition(),
            AudioPlayer.getDuration(),
          ]);
          setCurrentPosition(pos);
          setDuration(dur);
        } catch (e) {
          console.error('Progress update error:', e);
        }
      }, PROGRESS_UPDATE_INTERVAL);
    } else if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying]);

  const requestPermissions = async (): Promise<void> => {
    if (Platform.OS !== 'android') {
      setHasPermission(true);
      return;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
        {
          title: 'Audio Permission',
          message: 'This app needs access to your audio files to play music',
          buttonPositive: 'OK',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        setHasPermission(true);
        setStatus('Ready to play');
      } else {
        setError('Permission denied');
        setHasPermission(false);
      }
    } catch (err: any) {
      setError('Permission error: ' + err.message);
    }
  };

  const syncPlayingState = async (): Promise<void> => {
    try {
      const playing = await AudioPlayer.isPlaying();
      setIsPlaying(playing);
    } catch (e) {
      console.error('State sync error:', e);
    }
  };

  const handlePlay = async (): Promise<void> => {
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant audio permission first');
      return;
    }

    try {
      const fullPath = getFullPath(fileName);
      const result = await AudioPlayer.play(fullPath);
      setStatus(result || 'Playing...');
      setError('');
      await syncPlayingState();
      const dur = await AudioPlayer.getDuration();
      setDuration(dur);
    } catch (e: any) {
      setError(e.message || 'Failed to play');
      setStatus('Error occurred');
    }
  };

  const handlePause = async (): Promise<void> => {
    try {
      const result = await AudioPlayer.pause();
      setStatus(result || 'Paused');
      setError('');
      await syncPlayingState();
    } catch (e: any) {
      setError(e.message || 'Failed to pause');
    }
  };

  const handleRestart = async (): Promise<void> => {
    try {
      const fullPath = getFullPath(fileName);
      const result = await AudioPlayer.restart(fullPath);
      setStatus(result || 'Restarted');
      setError('');
      setCurrentPosition(0);
      await syncPlayingState();
      const dur = await AudioPlayer.getDuration();
      setDuration(dur);
    } catch (e: any) {
      setError(e.message || 'Failed to restart');
    }
  };

  const handleSeek = async (event: GestureResponderEvent): Promise<void> => {
    if (duration === 0) return;

    try {
      const {locationX} = event.nativeEvent;
      const progressBarWidth = 300;
      const percentage = Math.max(0, Math.min(1, locationX / progressBarWidth));
      const newPosition = Math.floor(percentage * duration);
      await AudioPlayer.seekTo(newPosition);
      setCurrentPosition(newPosition);
    } catch (e) {
      console.error('Seek error:', e);
    }
  };

  const progressPercent = duration > 0 ? (currentPosition / duration) * 100 : 0;

  return (
    <LinearGradient
      colors={['#0a0a0a', '#1a1a1a', '#2a2a2a']}
      style={styles.container}>
      <Text style={styles.title}>🎵 MP3 Player</Text>

      {/* File Input */}
      <View style={styles.fileInputContainer}>
        <Text style={styles.label}>File Name (in Downloads):</Text>
        <TextInput
          style={styles.input}
          value={fileName}
          onChangeText={setFileName}
          placeholder="test.mp3"
          placeholderTextColor="#666"
        />
        <Text style={styles.hint}>Full path: {getFullPath(fileName)}</Text>
      </View>

      <Text style={styles.nowPlaying}>
        Now playing: {getDisplayName(fileName)}
      </Text>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <TouchableWithoutFeedback onPress={handleSeek}>
          <View style={styles.progressBarBackground}>
            <View
              style={[styles.progressBarFill, {width: `${progressPercent}%`}]}
            />
          </View>
        </TouchableWithoutFeedback>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(currentPosition)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.playButton} onPress={handlePlay}>
          <Text style={styles.buttonText}>▶ PLAY</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
          <Text style={styles.buttonText}>⏸ PAUSE</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
          <Text style={styles.buttonText}>⟲ RESTART</Text>
        </TouchableOpacity>
      </View>

      {/* Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status:</Text>
        <Text style={styles.statusText}>{status}</Text>
      </View>

      {/* Error Display */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      ) : null}

      {/* Permission Warning */}
      {!hasPermission && (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>⚠️ Permission not granted</Text>
          <Button title="Request Permission" onPress={requestPermissions} />
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#FFD700',
    textShadowColor: 'rgba(255, 215, 0, 0.6)',
    textShadowOffset: {width: 0, height: 3},
    textShadowRadius: 10,
    letterSpacing: 2,
  },
  fileInputContainer: {
    width: '100%',
    maxWidth: 350,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    color: '#f5f5f5',
  },
  hint: {
    fontSize: 11,
    color: '#888',
    marginTop: 5,
    fontStyle: 'italic',
  },
  nowPlaying: {
    fontSize: 18,
    marginBottom: 25,
    color: '#FFD700',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  progressContainer: {
    width: '100%',
    maxWidth: 350,
    marginBottom: 30,
  },
  progressBarBackground: {
    width: '100%',
    height: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#3a3a3a',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  timeText: {
    fontSize: 13,
    color: '#aaa',
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
    marginBottom: 25,
  },
  playButton: {
    backgroundColor: '#1a4d1a',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2d6b2d',
    shadowColor: '#1a4d1a',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  pauseButton: {
    backgroundColor: '#4d4d1a',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6b6b2d',
    shadowColor: '#4d4d1a',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  restartButton: {
    backgroundColor: '#4d1a1a',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6b2d2d',
    shadowColor: '#4d1a1a',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  statusContainer: {
    marginTop: 15,
    padding: 18,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    minWidth: 250,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3a3a3a',
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 8,
    letterSpacing: 1,
  },
  statusText: {
    fontSize: 17,
    color: '#FFD700',
    textAlign: 'center',
    fontWeight: '600',
  },
  errorContainer: {
    marginTop: 15,
    padding: 18,
    backgroundColor: '#2a1a1a',
    borderRadius: 10,
    maxWidth: 300,
    borderWidth: 2,
    borderColor: '#4a2a2a',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    textAlign: 'center',
  },
  permissionContainer: {
    marginTop: 20,
    padding: 18,
    backgroundColor: '#2a2416',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4a3a2a',
  },
  permissionText: {
    fontSize: 14,
    color: '#FFD700',
    marginBottom: 10,
  },
});

export default AudioPlayerScreen;
