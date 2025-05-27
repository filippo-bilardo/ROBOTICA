/**
 * Modular Functional Programming Application
 * 
 * Esempio di applicazione modulare che utilizza principi di programmazione
 * funzionale con architettura moderna ES Modules.
 */

// ===== CORE UTILITIES =====

// utils/compose.js
const compose = (...fns) => (value) => fns.reduceRight((acc, fn) => fn(acc), value);
const pipe = (...fns) => (value) => fns.reduce((acc, fn) => fn(acc), value);
const curry = (fn) => (...args) => args.length >= fn.length ? fn(...args) : (...rest) => curry(fn)(...args, ...rest);

// utils/async.js
const asyncPipe = (...fns) => (value) => 
  fns.reduce(async (acc, fn) => fn(await acc), Promise.resolve(value));

const promiseAll = (promiseFns) => (value) =>
  Promise.all(promiseFns.map(fn => fn(value)));

const withTimeout = (timeout) => (promise) =>
  Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ]);

// ===== DOMAIN MODELS =====

// models/User.js
const createUser = ({ id, name, email, preferences = {} }) => ({
  id,
  name,
  email,
  preferences,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

const updateUser = (updates) => (user) => ({
  ...user,
  ...updates,
  updatedAt: new Date().toISOString()
});

const validateUser = (user) => {
  const errors = [];
  
  if (!user.name || user.name.trim().length === 0) {
    errors.push('Name is required');
  }
  
  if (!user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
    errors.push('Valid email is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    user
  };
};

// models/Post.js
const createPost = ({ title, content, authorId, tags = [] }) => ({
  id: generateId(),
  title,
  content,
  authorId,
  tags,
  createdAt: new Date().toISOString(),
  published: false,
  views: 0
});

const publishPost = (post) => ({ ...post, published: true });
const unpublishPost = (post) => ({ ...post, published: false });
const incrementViews = (post) => ({ ...post, views: post.views + 1 });

// ===== REPOSITORIES (DATA ACCESS) =====

// repositories/UserRepository.js
const UserRepository = (() => {
  // Mock database
  let users = [
    { id: '1', name: 'Alice Johnson', email: 'alice@example.com', preferences: { theme: 'dark' } },
    { id: '2', name: 'Bob Smith', email: 'bob@example.com', preferences: { theme: 'light' } },
    { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', preferences: { theme: 'auto' } }
  ];

  const findAll = () => Promise.resolve([...users]);
  
  const findById = (id) => 
    Promise.resolve(users.find(user => user.id === id));
  
  const findByEmail = (email) =>
    Promise.resolve(users.find(user => user.email === email));
  
  const save = (user) => {
    const existingIndex = users.findIndex(u => u.id === user.id);
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    return Promise.resolve(user);
  };
  
  const remove = (id) => {
    users = users.filter(user => user.id !== id);
    return Promise.resolve(true);
  };

  return { findAll, findById, findByEmail, save, remove };
})();

// repositories/PostRepository.js
const PostRepository = (() => {
  let posts = [
    { id: '1', title: 'Intro to FP', content: 'Functional programming basics...', authorId: '1', tags: ['fp', 'javascript'], published: true, views: 42 },
    { id: '2', title: 'Advanced Patterns', content: 'Advanced functional patterns...', authorId: '2', tags: ['fp', 'advanced'], published: true, views: 28 },
    { id: '3', title: 'Draft Post', content: 'This is a draft...', authorId: '1', tags: ['draft'], published: false, views: 0 }
  ];

  const findAll = () => Promise.resolve([...posts]);
  
  const findById = (id) =>
    Promise.resolve(posts.find(post => post.id === id));
  
  const findByAuthor = (authorId) =>
    Promise.resolve(posts.filter(post => post.authorId === authorId));
  
  const findPublished = () =>
    Promise.resolve(posts.filter(post => post.published));
  
  const save = (post) => {
    const existingIndex = posts.findIndex(p => p.id === post.id);
    if (existingIndex >= 0) {
      posts[existingIndex] = post;
    } else {
      posts.push(post);
    }
    return Promise.resolve(post);
  };

  return { findAll, findById, findByAuthor, findPublished, save };
})();

// ===== SERVICES (BUSINESS LOGIC) =====

// services/UserService.js
const UserService = (userRepository) => {
  const createNewUser = pipe(
    createUser,
    validateUser,
    async (validation) => {
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
      return userRepository.save(validation.user);
    }
  );

  const updateExistingUser = curry((id, updates) =>
    asyncPipe(
      () => userRepository.findById(id),
      (user) => {
        if (!user) throw new Error('User not found');
        return user;
      },
      updateUser(updates),
      validateUser,
      async (validation) => {
        if (!validation.isValid) {
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }
        return userRepository.save(validation.user);
      }
    )()
  );

  const getUserProfile = (id) =>
    userRepository.findById(id).then(user => {
      if (!user) throw new Error('User not found');
      return user;
    });

  const getAllUsers = () => userRepository.findAll();

  const deleteUser = (id) => userRepository.remove(id);

  return {
    createNewUser,
    updateExistingUser,
    getUserProfile,
    getAllUsers,
    deleteUser
  };
};

// services/PostService.js
const PostService = (postRepository, userRepository) => {
  const createNewPost = async (postData) => {
    const author = await userRepository.findById(postData.authorId);
    if (!author) {
      throw new Error('Author not found');
    }

    const post = createPost(postData);
    return postRepository.save(post);
  };

  const publishPostById = (id) =>
    asyncPipe(
      () => postRepository.findById(id),
      (post) => {
        if (!post) throw new Error('Post not found');
        return post;
      },
      publishPost,
      (post) => postRepository.save(post)
    )();

  const getPostWithAuthor = async (id) => {
    const post = await postRepository.findById(id);
    if (!post) throw new Error('Post not found');

    const author = await userRepository.findById(post.authorId);
    return { ...post, author };
  };

  const getPublishedPosts = () => postRepository.findPublished();

  const getUserPosts = (userId) => postRepository.findByAuthor(userId);

  const incrementPostViews = (id) =>
    asyncPipe(
      () => postRepository.findById(id),
      (post) => {
        if (!post) throw new Error('Post not found');
        return post;
      },
      incrementViews,
      (post) => postRepository.save(post)
    )();

  return {
    createNewPost,
    publishPostById,
    getPostWithAuthor,
    getPublishedPosts,
    getUserPosts,
    incrementPostViews
  };
};

// ===== APPLICATION LAYER =====

// app/Application.js
const createApplication = () => {
  // Dependency injection
  const userService = UserService(UserRepository);
  const postService = PostService(PostRepository, UserRepository);

  // Application-level operations
  const getDashboardData = async (userId) => {
    const [user, posts] = await Promise.all([
      userService.getUserProfile(userId),
      postService.getUserPosts(userId)
    ]);

    return {
      user,
      posts,
      statistics: {
        totalPosts: posts.length,
        publishedPosts: posts.filter(p => p.published).length,
        totalViews: posts.reduce((sum, p) => sum + p.views, 0)
      }
    };
  };

  const getHomePage = async () => {
    const [posts, users] = await Promise.all([
      postService.getPublishedPosts(),
      userService.getAllUsers()
    ]);

    const postsWithAuthors = await Promise.all(
      posts.map(async (post) => {
        const author = users.find(u => u.id === post.authorId);
        return { ...post, author };
      })
    );

    return {
      posts: postsWithAuthors.sort((a, b) => b.views - a.views),
      featuredAuthors: users.slice(0, 3)
    };
  };

  const searchContent = curry((query, type = 'all') => {
    const searchUsers = (users) =>
      users.filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      );

    const searchPosts = (posts) =>
      posts.filter(post =>
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.content.toLowerCase().includes(query.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );

    return async () => {
      const [users, posts] = await Promise.all([
        type === 'all' || type === 'users' ? userService.getAllUsers() : Promise.resolve([]),
        type === 'all' || type === 'posts' ? postService.getPublishedPosts() : Promise.resolve([])
      ]);

      return {
        users: type === 'posts' ? [] : searchUsers(users),
        posts: type === 'users' ? [] : searchPosts(posts),
        query,
        type
      };
    };
  });

  return {
    userService,
    postService,
    getDashboardData,
    getHomePage,
    searchContent
  };
};

// ===== API LAYER =====

// api/handlers.js
const createAPIHandlers = (app) => {
  const handleAsync = (fn) => async (req, res) => {
    try {
      const result = await fn(req, res);
      if (!res.headersSent) {
        res.json({ success: true, data: result });
      }
    } catch (error) {
      console.error('API Error:', error);
      if (!res.headersSent) {
        res.status(500).json({ 
          success: false, 
          error: error.message 
        });
      }
    }
  };

  const getUserProfile = handleAsync(async (req) => {
    const { id } = req.params;
    return app.userService.getUserProfile(id);
  });

  const createUser = handleAsync(async (req) => {
    return app.userService.createNewUser(req.body);
  });

  const getDashboard = handleAsync(async (req) => {
    const { userId } = req.params;
    return app.getDashboardData(userId);
  });

  const getHomePage = handleAsync(async () => {
    return app.getHomePage();
  });

  const searchContent = handleAsync(async (req) => {
    const { q: query, type = 'all' } = req.query;
    if (!query) {
      throw new Error('Search query is required');
    }
    return app.searchContent(query, type)();
  });

  const createPost = handleAsync(async (req) => {
    return app.postService.createNewPost(req.body);
  });

  const publishPost = handleAsync(async (req) => {
    const { id } = req.params;
    return app.postService.publishPostById(id);
  });

  return {
    getUserProfile,
    createUser,
    getDashboard,
    getHomePage,
    searchContent,
    createPost,
    publishPost
  };
};

// ===== UTILITY FUNCTIONS =====

const generateId = () => Math.random().toString(36).substr(2, 9);

// Logger middleware
const logger = (label) => (data) => {
  console.log(`[${label}]`, data);
  return data;
};

// Cache decorator
const withCache = (keyFn, ttl = 60000) => (fn) => {
  const cache = new Map();
  
  return async (...args) => {
    const key = keyFn(...args);
    const now = Date.now();
    
    if (cache.has(key)) {
      const { data, timestamp } = cache.get(key);
      if (now - timestamp < ttl) {
        return data;
      }
      cache.delete(key);
    }
    
    const result = await fn(...args);
    cache.set(key, { data: result, timestamp: now });
    return result;
  };
};

// ===== MAIN APPLICATION =====

const main = async () => {
  console.log('=== Modular Functional Application Demo ===\n');

  const app = createApplication();

  try {
    // Test user operations
    console.log('1. Creating new user...');
    const newUser = await app.userService.createNewUser({
      id: generateId(),
      name: 'David Wilson',
      email: 'david@example.com',
      preferences: { theme: 'dark', notifications: true }
    });
    console.log('Created user:', newUser);

    // Test dashboard
    console.log('\n2. Getting dashboard data...');
    const dashboard = await app.getDashboardData('1');
    console.log('Dashboard:', JSON.stringify(dashboard, null, 2));

    // Test home page
    console.log('\n3. Getting home page data...');
    const homePage = await app.getHomePage();
    console.log('Home page posts:', homePage.posts.length);
    console.log('Featured authors:', homePage.featuredAuthors.map(a => a.name));

    // Test search
    console.log('\n4. Searching content...');
    const searchResults = await app.searchContent('javascript', 'posts')();
    console.log('Search results:', searchResults);

    // Test post creation
    console.log('\n5. Creating and publishing post...');
    const newPost = await app.postService.createNewPost({
      title: 'Modular Architecture',
      content: 'Building scalable applications with modular functional architecture...',
      authorId: '1',
      tags: ['architecture', 'modules', 'scalability']
    });
    console.log('Created post:', newPost);

    await app.postService.publishPostById(newPost.id);
    console.log('Post published successfully');

    // Test error handling
    console.log('\n6. Testing error handling...');
    try {
      await app.userService.getUserProfile('nonexistent');
    } catch (error) {
      console.log('Expected error:', error.message);
    }

    console.log('\n=== Demo completed successfully! ===');

  } catch (error) {
    console.error('Application error:', error);
  }
};

// Export for use in other modules
export {
  createApplication,
  createAPIHandlers,
  UserService,
  PostService,
  UserRepository,
  PostRepository,
  createUser,
  createPost,
  validateUser,
  compose,
  pipe,
  curry,
  asyncPipe
};

// Run if this is the main module
if (typeof window === 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

console.log('=== Modular Functional Application Module Loaded ===');
