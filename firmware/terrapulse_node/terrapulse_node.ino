#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME680.h>
#include <RadioLib.h>
#include <driver/i2s.h>

// Uncomment and include the Edge Impulse library once exported and installed
// #include <terrapulse-forest-guard_inferencing.h>

#define BME_SCK 22
#define BME_SDA 21

// I2S Microphone (INMP441)
#define I2S_WS 15
#define I2S_SD 13
#define I2S_SCK 14

// SX1262 Pins (Modify to match your specific ESP32-S3 board's LoRa wiring)
#define LORA_NSS 10
#define LORA_DIO1 9
#define LORA_NRST 11
#define LORA_BUSY 12

Adafruit_BME680 bme(&Wire);
SX1262 radio = new Module(LORA_NSS, LORA_DIO1, LORA_NRST, LORA_BUSY);

#define SAMPLE_RATE 16000

String nodeId = "ST-02"; // Unique Node ID
float currentTemp = 29.0;
float currentHum = 60.0;
float currentSmoke = 3.0;

void setup() {
    Serial.begin(115200);
    while(!Serial);
    
    // 1. Initialize BME680
    Wire.begin(BME_SDA, BME_SCK);
    if (!bme.begin()) {
        Serial.println("Could not find a valid BME680 sensor, check wiring!");
    } else {
        bme.setTemperatureOversampling(BME680_OS_8X);
        bme.setHumidityOversampling(BME680_OS_2X);
        bme.setPressureOversampling(BME680_OS_4X);
        bme.setIIRFilterSize(BME680_FILTER_SIZE_3);
        bme.setGasHeater(320, 150); // 320*C for 150 ms
        Serial.println("BME680 Init Success");
    }

    // 2. Initialize SX1262 LoRa
    Serial.print(F("[SX1262] Initializing ... "));
    // 865.2 MHz (India), 125 kHz BW, SF7, CR 4/5, SyncWord 0x12, PreambleLength 10
    int state = radio.begin(865.2, 125.0, 7, 5, 0x12, 10, 8, 1.6, false);
    if (state == RADIOLIB_ERR_NONE) {
        Serial.println(F("success!"));
    } else {
        Serial.print(F("failed, code "));
        Serial.println(state);
    }

    // 3. Initialize I2S (INMP441)
    i2s_config_t i2s_config = {
        .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX),
        .sample_rate = SAMPLE_RATE,
        .bits_per_sample = I2S_BITS_PER_SAMPLE_32BIT,
        .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
        .communication_format = I2S_COMM_FORMAT_STAND_I2S,
        .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
        .dma_buf_count = 8,
        .dma_buf_len = 1024,
        .use_apll = false,
        .tx_desc_auto_clear = false,
        .fixed_mclk = 0
    };

    i2s_pin_config_t pin_config = {
        .bck_io_num = I2S_SCK,
        .ws_io_num = I2S_WS,
        .data_out_num = I2S_PIN_NO_CHANGE,
        .data_in_num = I2S_SD
    };

    i2s_driver_install(I2S_NUM_0, &i2s_config, 0, NULL);
    i2s_set_pin(I2S_NUM_0, &pin_config);
    i2s_set_clk(I2S_NUM_0, SAMPLE_RATE, I2S_BITS_PER_SAMPLE_32BIT, I2S_CHANNEL_MONO);
    Serial.println("I2S Mic Init Success");
}

// Dummy Edge Impulse inference block
void runTinyMLInference(String &detectedThreat, float &confidence) {
    // -------------------------------------------------------------
    // EDGE IMPULSE BOILERPLATE
    // -------------------------------------------------------------
    /*
    signal_t features_signal;
    features_signal.total_length = EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE;
    features_signal.get_data = &microphone_audio_signal_get_data;
    
    ei_impulse_result_t result = { 0 };
    EI_IMPULSE_ERROR res = run_classifier(&features_signal, &result, false);
    
    float max_val = 0;
    int max_idx = 0;
    for (size_t ix = 0; ix < EI_CLASSIFIER_LABEL_COUNT; ix++) {
        if(result.classification[ix].value > max_val) {
            max_val = result.classification[ix].value;
            max_idx = ix;
        }
    }
    
    String label = String(result.classification[max_idx].label);
    
    // Assuming labels are "chainsaw" and "gunshot"
    if(max_val > 0.6 && (label == "chainsaw" || label == "gunshot")) {
        detectedThreat = label;
        detectedThreat.toUpperCase();
        confidence = max_val * 100.0;
    } else {
        detectedThreat = "NONE";
        confidence = 0.0;
    }
    */
    
    // Placeholder returning no threat
    detectedThreat = "NONE";
    confidence = 0.0;
}

void loop() {
    // 1. Read BME680
    if (bme.performReading()) {
        currentTemp = bme.temperature;
        currentHum = bme.humidity;
        // Using gas resistance as an inverted stand-in for "smoke/VOC" level
        currentSmoke = max(0.0, 500.0 - (bme.gas_resistance / 1000.0));
    }

    // 2. Audio Inference
    String threat = "NONE";
    float conf = 0.0;
    runTinyMLInference(threat, conf);

    // 3. Fallback: Trigger Fire Alert if Smoke/Temp spike abnormally
    if(currentSmoke > 35.0 || currentTemp > 45.0) {
        threat = "FOREST_FIRE";
        conf = 96.5;
    }

    // 4. Construct JSON Payload
    // Expected Payload: {nodeId, lat, lng, temp, hum, smoke, threat, confidence}
    String payload = "{";
    payload += "\"nodeId\":\"" + nodeId + "\",";
    payload += "\"lat\":29.5300,";
    payload += "\"lng\":78.7747,";
    payload += "\"temp\":" + String(currentTemp, 1) + ",";
    payload += "\"hum\":" + String(currentHum, 1) + ",";
    payload += "\"smoke\":" + String(currentSmoke, 1) + ",";
    payload += "\"threat\":\"" + threat + "\",";
    payload += "\"confidence\":" + String(conf, 1);
    payload += "}";

    // 5. Transmit via LoRa
    Serial.print("Transmitting packet: ");
    Serial.println(payload);
    int state = radio.transmit(payload);

    if (state == RADIOLIB_ERR_NONE) {
        Serial.println("Transmit successful!");
    } else {
        Serial.print("Transmit failed, code ");
        Serial.println(state);
    }

    delay(2000); // Wait 2 seconds before next inference + tx cycle
}
