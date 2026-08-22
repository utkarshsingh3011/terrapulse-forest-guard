# Edge Impulse TinyML Integration Guide for TerraPulse ESP32-S3

This guide provides the exact steps needed to replace the laptop-based YAMNet audio classifier with a standalone, low-power machine learning model running directly on the ESP32-S3 node.

## Prerequisites
1. An Edge Impulse account (https://edgeimpulse.com/)
2. Audio dataset representing "Chainsaws" and "Gunshots" (WAV files at 16000Hz).
3. Arduino IDE with ESP32 board definitions installed.

## Step 1: Create and Train the Model in Edge Impulse
1. Create a new project in Edge Impulse (e.g., "TerraPulse Acoustic").
2. Upload your WAV files to the **Data Acquisition** tab, labeling them as `chainsaw`, `gunshot`, and `noise` (ambient forest sounds).
3. Navigate to **Impulse Design** -> **Create Impulse**.
   - Time Series Data (Window size: 1000ms, Window increase: 500ms)
   - Add a processing block: **Audio (MFE)** or **Audio (Spectrogram)**.
   - Add a learning block: **Classification (Keras)**.
4. Go to the **MFE/Spectrogram** tab and click **Generate features**.
5. Go to the **Classifier** tab and click **Start training**. Aim for >90% accuracy.
6. Test your model in the **Live classification** tab.

## Step 2: Export the Arduino Library
1. Navigate to the **Deployment** tab.
2. Select **Arduino library**.
3. Under *Select optimizations*, choose **Quantized (Int8)**. This is crucial for the ESP32 to run it quickly and save memory.
4. Click **Build**. This will download a `.zip` file containing your trained model as a C++ library.

## Step 3: Install the Library in Arduino IDE
1. Open the Arduino IDE.
2. Go to **Sketch** -> **Include Library** -> **Add .ZIP Library...**
3. Select the `.zip` file you downloaded from Edge Impulse.

## Step 4: Integrate the Library into the Firmware
Now you can uncomment the inference block in `terrapulse_node.ino`.

1. **Include the Header:** At the top of `terrapulse_node.ino`, include the library header file. The name will match your Edge Impulse project name.
   ```cpp
   #include <TerraPulse_Acoustic_inferencing.h>
   ```

2. **Implement the Audio Callback:** You need a function that Edge Impulse can call to grab audio chunks from your I2S buffer.
   ```cpp
   int microphone_audio_signal_get_data(size_t offset, size_t length, float *out_ptr) {
       // Read 'length' samples from your I2S DMA buffer and convert to float
       // Provide it to 'out_ptr'
       return 0;
   }
   ```

3. **Enable the Inference Logic:** Replace the dummy `runTinyMLInference` function in the sketch with the real Edge Impulse SDK call:
   ```cpp
   void runTinyMLInference(String &detectedThreat, float &confidence) {
       signal_t features_signal;
       features_signal.total_length = EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE;
       features_signal.get_data = &microphone_audio_signal_get_data;
       
       ei_impulse_result_t result = { 0 };
       EI_IMPULSE_ERROR res = run_classifier(&features_signal, &result, false);
       
       if (res != EI_IMPULSE_OK) {
           Serial.printf("ERR: Failed to run classifier (%d)\n", res);
           return;
       }
       
       float max_val = 0;
       int max_idx = 0;
       for (size_t ix = 0; ix < EI_CLASSIFIER_LABEL_COUNT; ix++) {
           if(result.classification[ix].value > max_val) {
               max_val = result.classification[ix].value;
               max_idx = ix;
           }
       }
       
       String label = String(result.classification[max_idx].label);
       if(max_val > 0.6 && (label == "chainsaw" || label == "gunshot")) {
           detectedThreat = label;
           detectedThreat.toUpperCase();
           confidence = max_val * 100.0;
       } else {
           detectedThreat = "NONE";
           confidence = 0.0;
       }
   }
   ```

## Step 5: Flash and Run
Compile the sketch for the ESP32-S3 and flash it. Your node is now fully autonomous! It will run the neural network locally on the ESP32 and transmit anomaly detections over LoRaWAN directly to your gateway.
