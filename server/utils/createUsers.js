// Using built-in fetch (Node.js 18+)

const users = [
  {
    name: 'John Smith',
    email: 'john.smith@taskme.com',
    password: 'password123',
    title: 'Senior Developer',
    role: 'Developer'
  },
  {
    name: 'Sarah Johnson', 
    email: 'sarah.johnson@taskme.com',
    password: 'password123',
    title: 'Project Manager',
    role: 'Manager'
  },
  {
    name: 'Mike Wilson',
    email: 'mike.wilson@taskme.com', 
    password: 'password123',
    title: 'Kitchen Manager',
    role: 'Kitchen Staff'
  },
  {
    name: 'Emily Davis',
    email: 'emily.davis@taskme.com',
    password: 'password123', 
    title: 'Database Administrator',
    role: 'Developer'
  }
];

const createUsers = async () => {
  for (const user of users) {
    try {
      const response = await fetch('http://localhost:8800/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });
      
      if (response.ok) {
        console.log(`Created user: ${user.name}`);
      } else {
        const error = await response.json();
        console.log(`User ${user.name}: ${error.message}`);
      }
    } catch (error) {
      console.error(`Error creating ${user.name}:`, error.message);
    }
  }
};

createUsers();