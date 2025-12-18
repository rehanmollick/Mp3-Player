package com.interviewapp;

import android.media.MediaPlayer;
import android.util.Log;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

/**
 * Native Android module for MP3 audio playback.
 * Exposes MediaPlayer functionality to React Native via the bridge.
 */
public class AudioPlayerModule extends ReactContextBaseJavaModule {

    private static final String TAG = "AudioPlayerModule";
    private MediaPlayer mediaPlayer;
    private String currentFilePath = null;

    AudioPlayerModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return TAG;
    }

    @ReactMethod
    public void play(String filePath, Promise promise) {
        try {
            Log.d(TAG, "Play: " + filePath);

            // Handle file switch
            if (currentFilePath != null && !currentFilePath.equals(filePath)) {
                releasePlayer();
            }

            // Resume if paused
            if (mediaPlayer != null && !mediaPlayer.isPlaying() && filePath.equals(currentFilePath)) {
                mediaPlayer.start();
                promise.resolve("Resumed playing");
                return;
            }

            // Already playing
            if (mediaPlayer != null && mediaPlayer.isPlaying() && filePath.equals(currentFilePath)) {
                promise.resolve("Already playing");
                return;
            }

            // Start new playback
            if (mediaPlayer != null) {
                mediaPlayer.release();
            }

            mediaPlayer = new MediaPlayer();
            mediaPlayer.setDataSource(filePath);
            mediaPlayer.prepare();
            mediaPlayer.start();
            currentFilePath = filePath;

            promise.resolve("Started playing");
        } catch (Exception e) {
            Log.e(TAG, "Play error: " + e.getMessage(), e);
            promise.reject("PLAY_ERROR", "Failed to play: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void pause(Promise promise) {
        try {
            if (mediaPlayer != null && mediaPlayer.isPlaying()) {
                mediaPlayer.pause();
                promise.resolve("Paused");
            } else {
                promise.resolve("Not playing");
            }
        } catch (Exception e) {
            Log.e(TAG, "Pause error: " + e.getMessage(), e);
            promise.reject("PAUSE_ERROR", "Failed to pause: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void restart(String filePath, Promise promise) {
        try {
            Log.d(TAG, "Restart: " + filePath);
            releasePlayer();

            mediaPlayer = new MediaPlayer();
            mediaPlayer.setDataSource(filePath);
            mediaPlayer.prepare();
            mediaPlayer.start();
            currentFilePath = filePath;

            promise.resolve("Restarted");
        } catch (Exception e) {
            Log.e(TAG, "Restart error: " + e.getMessage(), e);
            promise.reject("RESTART_ERROR", "Failed to restart: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void stop(Promise promise) {
        try {
            if (mediaPlayer != null) {
                mediaPlayer.stop();
                mediaPlayer.release();
                mediaPlayer = null;
                currentFilePath = null;
                promise.resolve("Stopped");
            } else {
                promise.resolve("Nothing to stop");
            }
        } catch (Exception e) {
            Log.e(TAG, "Stop error: " + e.getMessage(), e);
            promise.reject("STOP_ERROR", "Failed to stop: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void getCurrentPosition(Promise promise) {
        try {
            int position = mediaPlayer != null ? mediaPlayer.getCurrentPosition() : 0;
            promise.resolve(position);
        } catch (Exception e) {
            Log.e(TAG, "Position error: " + e.getMessage(), e);
            promise.reject("POSITION_ERROR", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void getDuration(Promise promise) {
        try {
            int duration = mediaPlayer != null ? mediaPlayer.getDuration() : 0;
            promise.resolve(duration);
        } catch (Exception e) {
            Log.e(TAG, "Duration error: " + e.getMessage(), e);
            promise.reject("DURATION_ERROR", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void isPlaying(Promise promise) {
        try {
            boolean playing = mediaPlayer != null && mediaPlayer.isPlaying();
            promise.resolve(playing);
        } catch (Exception e) {
            Log.e(TAG, "State error: " + e.getMessage(), e);
            promise.reject("STATE_ERROR", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void seekTo(int position, Promise promise) {
        try {
            if (mediaPlayer != null) {
                mediaPlayer.seekTo(position);
                promise.resolve("Seeked to " + position);
            } else {
                promise.reject("SEEK_ERROR", "No media player available");
            }
        } catch (Exception e) {
            Log.e(TAG, "Seek error: " + e.getMessage(), e);
            promise.reject("SEEK_ERROR", e.getMessage(), e);
        }
    }

    private void releasePlayer() {
        if (mediaPlayer != null) {
            mediaPlayer.stop();
            mediaPlayer.release();
            mediaPlayer = null;
        }
        currentFilePath = null;
    }
}
