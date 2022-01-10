const rfc = require('mfrc522-rpi');
const SoftSPI = require("rpi-softspi");
const axios = require('axios');

const softSPI = new SoftSPI({
    clock: 23, // pin number of SCLK
    mosi: 19, // pin number of MOSI
    miso: 21, // pin number of MISO
    client: 24 // pin number of CS
  });
  
const mfrc = new rfc(softSPI).setResetPin(22).setBuzzerPin(18);
//# Scan for cards
setInterval(function() {
    //# reset card
    mfrc.reset();
  
    //# Scan for cards
    let response = mfrc.findCard();
    if (!response.status) {
      return;
    }
    console.log("Card detected, CardType: " + response.bitSize);
  
    //# Get the UID of the card
    response = mfrc.getUid();
    if (!response.status) {
      console.log("UID Scan Error");
      return;
    }
    //# If we have the UID, continue
    const uid = response.data;
    console.log(
      "Card read UID: %s %s %s %s",
      uid[0].toString(16),
      uid[1].toString(16),
      uid[2].toString(16),
      uid[3].toString(16)
    );
    if(uid.toString() == [ 151, 167, 76, 180, 200 ].toString()) {
        axios({
            method: 'get',
            url: 'http://localhost:8888/rfc-play'
          });
    } 
console.log(uid)
    if(uid.toString() == [ 138, 45, 245, 129, 211 ].toString()) {
        axios({
            method: 'get',
            url: 'http://localhost:8888/tag-play'
          });
    } 
  
    //# Select the scanned card
    const memoryCapacity = mfrc.selectCard(uid);
    console.log("Card Memory Capacity: " + memoryCapacity);
  
    //# This is the default key for authentication
    const key = [0xff, 0xff, 0xff, 0xff, 0xff, 0xff];
  
    //# Authenticate on Block 8 with key and uid
    if (!mfrc.authenticate(8, key, uid)) {
      console.log("Authentication Error");
      return;
    }
  
    //# Dump Block 8
    console.log("Block: 8 Data: " + mfrc.getDataForBlock(8));
  
    //# Stop
    mfrc.stopCrypto();
  }, 500);
  