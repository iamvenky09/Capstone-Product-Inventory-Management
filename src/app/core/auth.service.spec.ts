import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;
  const apiUrl = 'http://localhost:3000/users';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify(); 
    localStorage.clear(); 
  });

  describe('boundary', () => {
    it('should return true and set currentUser in localStorage on successful login', () => {
      const mockUsers = [{ email: 'test@example.com', password: 'password123', name: 'Test User' }];
      const email = 'test@example.com';
      const password = 'password123';

      service.login(email, password).subscribe((result) => {
        expect(result).toBe(true);
        const currentUser = JSON.parse(localStorage.getItem('currentUser')!);
        expect(currentUser).toEqual(mockUsers[0]);
      });

      const req = httpTestingController.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });

    it('should return false on unsuccessful login', () => {
      const mockUsers = [{ email: 'other@example.com', password: 'password123' }];
      const email = 'test@example.com';
      const password = 'password123';

      service.login(email, password).subscribe((result) => {
        expect(result).toBe(false);
        expect(localStorage.getItem('currentUser')).toBeNull();
      });

      const req = httpTestingController.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });

    it('should remove currentUser from localStorage on logout', () => {
      localStorage.setItem('currentUser', JSON.stringify({ email: 'test@example.com' }));

      service.logout();

      expect(localStorage.getItem('currentUser')).toBeNull();
    });

    it('should return true if currentUser is in localStorage', () => {
      localStorage.setItem('currentUser', JSON.stringify({ email: 'test@example.com' }));

      expect(service.isLoggedIn()).toBe(true);
    });

    it('should return false if currentUser is not in localStorage', () => {
      expect(service.isLoggedIn()).toBe(false);
    });

    it('should first send a GET request to check existing users, then a POST request to register a new user', () => {
      const newUser = { email: 'newuser@example.com', password: 'password123' };
    
      service.register(newUser).subscribe({
        next: (response) => {
          expect(response).toEqual(newUser);
        },
        error: () => fail('Expected success, but got an error')
      });
  
      const getReq = httpTestingController.expectOne(`${apiUrl}/users`);
      expect(getReq.request.method).toBe('GET');
    
      getReq.flush([]);
    
      const postReq = httpTestingController.expectOne(`${apiUrl}/users`);
      expect(postReq.request.method).toBe('POST');
      expect(postReq.request.body).toEqual(newUser);
    
      postReq.flush(newUser);
    });
    

    it('should not send a POST request if user already exists', () => {
      const existingUser = { email: 'existing@example.com', password: 'password123' };
      const newUser = { email: 'existing@example.com', password: 'password123' };

      service.register(newUser).subscribe({
        next: () => fail('Expected error, but got success'),
        error: (err) => {
          expect(err.message).toBe('Email already exists! Please use a different email.');
        }
      });

      const getReq = httpTestingController.expectOne(apiUrl);
      expect(getReq.request.method).toBe('GET');

      getReq.flush([existingUser]);


      httpTestingController.expectNone(apiUrl);
    });
  });
});
