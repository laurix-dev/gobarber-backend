import AppError from '@shared/errors/AppError';
import FakeHashProvider from '@modules/users/providers/HashProvider/fakes/FakeHashProvider';
import FakeUserRepository from '../repositories/fakes/FakeUsersRepository';
import UpdateProfileService from './UpdateProfileService';

let fakeUserRepository: FakeUserRepository;
let fakeHashProvider: FakeHashProvider;
let updateProfile: UpdateProfileService;

describe('UpdateProfile', () => {
  beforeEach(() => {
    fakeUserRepository = new FakeUserRepository();
    fakeHashProvider = new FakeHashProvider();

    updateProfile = new UpdateProfileService(
      fakeUserRepository,
      fakeHashProvider,
    );
  });

  it('should be able to update a user profile', async () => {
    const user = await fakeUserRepository.create({
      name: 'leandro',
      email: 'leandro@example.com',
      password: '123456',
    });

    const updatedUser = await updateProfile.execute({
      user_id: user.id,
      name: 'John Doe',
      email: 'johndoe@example.com',
    });

    expect(updatedUser.name).toBe('John Doe');
    expect(updatedUser.email).toBe('johndoe@example.com');
  });

  it('should not be able to change to another user email', async () => {
    await fakeUserRepository.create({
      name: 'leandro',
      email: 'leandro@example.com',
      password: '123456',
    });

    const user2 = await fakeUserRepository.create({
      name: 'leandro',
      email: 'leandro2@example.com',
      password: '123456',
    });

    await expect(
      updateProfile.execute({
        user_id: user2.id,
        name: 'John Doe',
        email: 'leandro@example.com',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should be able to update the password', async () => {
    const user = await fakeUserRepository.create({
      name: 'leandro',
      email: 'leandro@example.com',
      password: '123456',
    });

    const updatedUser = await updateProfile.execute({
      user_id: user.id,
      name: 'leandro',
      email: 'leandro@example.com',
      old_password: '123456',
      password: '123123',
    });

    expect(updatedUser.password).toBe('123123');
  });

  it('should not be able to update the password without the old password', async () => {
    const user = await fakeUserRepository.create({
      name: 'leandro',
      email: 'leandro@example.com',
      password: '123456',
    });

    await expect(
      updateProfile.execute({
        user_id: user.id,
        name: 'leandro',
        email: 'leandro@example.com',
        password: '123123',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to update the password with wrong old password', async () => {
    const user = await fakeUserRepository.create({
      name: 'leandro',
      email: 'leandro@example.com',
      password: '123456',
    });

    await expect(
      updateProfile.execute({
        user_id: user.id,
        name: 'leandro',
        email: 'leandro@example.com',
        old_password: 'wrongpassword',
        password: '123123',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to update a non-existing user', async () => {
    await expect(
      updateProfile.execute({
        user_id: 'non-existing-id',
        name: 'leandro',
        email: 'leandro@example.com',
        old_password: 'wrongpassword',
        password: '123123',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
