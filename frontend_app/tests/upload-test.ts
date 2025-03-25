import { loginUser, uploadFile } from '../lib/api';

async function testLoginAndUpload() {
  try {
    // Simulate login
    const loginResponse = await loginUser('testuser@example.com', 'password123');
    console.log('Login successful:', loginResponse);

    if (loginResponse.access_token) {
      // Simulate file upload
      const file = new File(['test audio content'], 'test-audio.mp3', { type: 'audio/mpeg' });
      const uploadResponse = await uploadFile(file, '1', '2', loginResponse.access_token);
      console.log('Upload successful:', uploadResponse);
    } else {
      console.error('Login failed: No access token received');
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testLoginAndUpload();

