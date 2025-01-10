const {loginUser} = require('../src/utils/auth')
const admin = require('firebase-admin')
const db = require('../src/utils/dynamoDB')

const mockResponse = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  

  jest.mock('firebase-admin', () => ({
    auth: () => ({
      verifyIdToken: jest.fn()
    }),
  }));
  
  jest.mock('../src/utils/dynamoDB', () => {
    return jest.fn().mockImplementation(() => ({
      getUserByEmail: jest.fn(),
      getUser: jest.fn()
    }));
  });
  
  // Mock the entire firebaseConfig import
  jest.mock('../src/utils/firebaseConfig.mjs', () => ({
    default: {
      auth: () => ({
        verifyIdToken: jest.fn()
      })
    }
  }));
  
  // Mock the loadFirebaseConfig function
  jest.mock('../src/utils/auth', () => {
    const originalModule = jest.requireActual('../src/utils/auth');
    return {
      ...originalModule,
      loadFirebaseConfig: jest.fn()
    };
  });
  
  describe('loginUser', () => {
    let mockRequest;
    let dbInstance;
  
    beforeEach(() => {
      jest.clearAllMocks();
      
      // Create DB instance
      dbInstance = new db();
      
      mockRequest = {
        body: {
          token: 'fakeToken',
        },
      };

      // Set firebaseAdmin directly
      global.firebaseAdmin = require('firebase-admin');
    });
  
    it('should return 400 if token is missing', async () => {
      mockRequest.body.token = null; // Simulate missing token
  
      await loginUser(mockRequest, mockResponse);
  
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Missing token ' });
    });
  
    it('should return 200 if token is valid and user exists', async () => {
      // Mock successful token verification
      admin.auth().verifyIdToken.mockResolvedValue({
        uid: '12345',
        email: 'user@example.com',
      });
  
      // Mock user lookup in database
      dbInstance.getUserByEmail.mockResolvedValue({ id: '12345', email: 'user@example.com' });
  
      await loginUser(mockRequest, mockResponse);
  
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith({ message: 'User logged in successfully' });
    });
  
    it('should return 404 if user is not found', async () => {
      // Mock successful token verification
      admin.auth().verifyIdToken.mockResolvedValue({
        uid: '12345',
        email: 'user@example.com',
      });
  
      // Mock user lookup in database (user not found)
      dbInstance.getUserByEmail.mockResolvedValue(null);
  
      await loginUser(mockRequest, mockResponse);
  
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
  
    it('should return 400 if token verification fails', async () => {
      // Simulate token verification failure
      admin.auth().verifyIdToken.mockRejectedValue(new Error('Token verification failed'));
  
      await loginUser(mockRequest, mockResponse);
  
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Token verification failed' });
    });
  });