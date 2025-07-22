<template>
  <div class="user-form-container">
    <h1>User Registration Form </h1>
    
   

    <!-- Status Messages -->
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <!-- User Form -->
    <form @submit.prevent="submitForm" class="user-form">
      <div class="form-group">
        <label for="name">Full Name *</label>
        <input
          type="text"
          id="name"
          v-model="formData.name"
          :class="{ 'error': errors.name }"
          placeholder="Enter your full name"
          required
        />
        <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
      </div>

      <div class="form-group">
        <label for="email">Email Address *</label>
        <input
          type="email"
          id="email"
          v-model="formData.email"
          :class="{ 'error': errors.email }"
          placeholder="Enter your email address"
          required
        />
        <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
      </div>

      <div class="form-group">
        <label for="address">Address *</label>
        <textarea
          id="address"
          v-model="formData.address"
          :class="{ 'error': errors.address }"
          placeholder="Enter your full address"
          rows="3"
          required
        ></textarea>
        <span v-if="errors.address" class="error-text">{{ errors.address }}</span>
      </div>

      <div class="form-group">
        <label for="phone">Phone Number (Optional)</label>
        <input
          type="tel"
          id="phone"
          v-model="formData.phone"
          placeholder="Enter your phone number"
        />
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="isSubmitting" class="submit-btn">
          {{ isSubmitting ? 'Saving...' : 'Save User Data' }}
        </button>
        <button type="button" @click="clearForm" class="clear-btn">
          Clear Form
        </button>
      </div>
    </form>

    <!-- Saved Users List -->
    <div v-if="savedUsers.length > 0" class="saved-users">
      <h2>Saved Users ({{ savedUsers.length }})</h2>
      <div class="users-grid">
        <div v-for="user in savedUsers" :key="user.id" class="user-card">
          <h3>{{ user.name }}</h3>
          <p><strong>Email:</strong> {{ user.email }}</p>
          <p><strong>Address:</strong> {{ user.address }}</p>
          <p v-if="user.phone"><strong>Phone:</strong> {{ user.phone }}</p>
          <p class="timestamp"><strong>Saved:</strong> {{ formatDate(user.createdAt) }}</p>
          <button @click="deleteUser(user.id)" class="delete-btn">Delete</button>
        </div>
      </div>
    </div>

    <!-- Demo Actions -->
    <div v-if="!useFirebase" class="demo-actions">
      <button @click="clearAllData" class="danger-btn">
        Clear All Demo Data
      </button>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { localDB } from '../localStorage'

// Firebase imports (will only be used if Firebase is configured)
let db = null;
let collection = null;
let addDoc = null;
let getDocs = null;
let deleteDoc = null;
let doc = null;
let serverTimestamp = null;

export default {
  name: 'UserRegistrationFormDemo',
  setup() {
    // Reactive data
    const formData = reactive({
      name: '',
      email: '',
      address: '',
      phone: ''
    })

    const errors = reactive({
      name: '',
      email: '',
      address: ''
    })

    const successMessage = ref('')
    const errorMessage = ref('')
    const isSubmitting = ref(false)
    const savedUsers = ref([])
    const useFirebase = ref(false)

    // Try to load Firebase modules
    const loadFirebase = async () => {
      try {
        const firebaseModule = await import('../firebase')
        const firestoreModule = await import('firebase/firestore')
        
        db = firebaseModule.db
        collection = firestoreModule.collection
        addDoc = firestoreModule.addDoc
        getDocs = firestoreModule.getDocs
        deleteDoc = firestoreModule.deleteDoc
        doc = firestoreModule.doc
        serverTimestamp = firestoreModule.serverTimestamp
        
        return true
      } catch (error) {
        console.warn('Firebase not configured or available:', error)
        return false
      }
    }

    // Methods
    const validateForm = () => {
      // Clear previous errors
      errors.name = ''
      errors.email = ''
      errors.address = ''

      let isValid = true

      // Validate name
      if (!formData.name.trim()) {
        errors.name = 'Name is required'
        isValid = false
      } else if (formData.name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters long'
        isValid = false
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!formData.email.trim()) {
        errors.email = 'Email is required'
        isValid = false
      } else if (!emailRegex.test(formData.email)) {
        errors.email = 'Please enter a valid email address'
        isValid = false
      }

      // Validate address
      if (!formData.address.trim()) {
        errors.address = 'Address is required'
        isValid = false
      } else if (formData.address.trim().length < 10) {
        errors.address = 'Please enter a complete address (at least 10 characters)'
        isValid = false
      }

      return isValid
    }

    const submitForm = async () => {
      // Clear previous messages
      successMessage.value = ''
      errorMessage.value = ''

      // Validate form
      if (!validateForm()) {
        return
      }

      isSubmitting.value = true

      try {
        const userData = {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          address: formData.address.trim(),
          phone: formData.phone.trim() || null
        }

        if (useFirebase.value && db) {
          // Use Firebase
          const docRef = await addDoc(collection(db, 'users'), {
            ...userData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          })
          console.log('Document written with ID: ', docRef.id)
        } else {
          // Use localStorage
          await localDB.addUser(userData)
        }

        successMessage.value = 'User data saved successfully!'
        
        // Clear form after successful submission
        clearForm()
        
        // Refresh the users list
        await loadUsers()

      } catch (error) {
        console.error('Error adding document: ', error)
        errorMessage.value = 'Error saving user data. Please try again.'
      } finally {
        isSubmitting.value = false
      }
    }

    const clearForm = () => {
      formData.name = ''
      formData.email = ''
      formData.address = ''
      formData.phone = ''
      
      // Clear errors
      errors.name = ''
      errors.email = ''
      errors.address = ''
      
      // Clear messages
      successMessage.value = ''
      errorMessage.value = ''
    }

    const loadUsers = async () => {
      try {
        if (useFirebase.value && db) {
          // Load from Firebase
          const querySnapshot = await getDocs(collection(db, 'users'))
          savedUsers.value = []
          
          querySnapshot.forEach((doc) => {
            savedUsers.value.push({
              id: doc.id,
              ...doc.data()
            })
          })
          
          // Sort by creation date (newest first)
          savedUsers.value.sort((a, b) => {
            if (a.createdAt && b.createdAt) {
              return b.createdAt.seconds - a.createdAt.seconds
            }
            return 0
          })
        } else {
          // Load from localStorage
          savedUsers.value = await localDB.getUsers()
          
          // Sort by creation date (newest first)
          savedUsers.value.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt)
          })
        }
        
      } catch (error) {
        console.error('Error loading users: ', error)
        errorMessage.value = 'Error loading saved users.'
      }
    }

    const deleteUser = async (userId) => {
      if (!confirm('Are you sure you want to delete this user?')) {
        return
      }

      try {
        if (useFirebase.value && db) {
          // Delete from Firebase
          await deleteDoc(doc(db, 'users', userId))
        } else {
          // Delete from localStorage
          await localDB.deleteUser(userId)
        }
        
        successMessage.value = 'User deleted successfully!'
        
        // Refresh the users list
        await loadUsers()
        
      } catch (error) {
        console.error('Error deleting user: ', error)
        errorMessage.value = 'Error deleting user. Please try again.'
      }
    }

    const clearAllData = async () => {
      if (!confirm('Are you sure you want to clear all demo data? This cannot be undone.')) {
        return
      }

      try {
        await localDB.clearAll()
        savedUsers.value = []
        successMessage.value = 'All demo data cleared successfully!'
      } catch (error) {
        console.error('Error clearing data: ', error)
        errorMessage.value = 'Error clearing data.'
      }
    }

    const switchDatabase = async () => {
      if (useFirebase.value) {
        const firebaseLoaded = await loadFirebase()
        if (!firebaseLoaded) {
          useFirebase.value = false
          errorMessage.value = 'Firebase not configured. Using localStorage instead.'
          return
        }
      }
      
      // Reload users from the selected database
      await loadUsers()
    }

    const formatDate = (timestamp) => {
      if (!timestamp) return 'Unknown'
      
      // Handle different timestamp formats
      let date
      if (typeof timestamp === 'string') {
        date = new Date(timestamp)
      } else if (timestamp.toDate) {
        // Firestore timestamp
        date = timestamp.toDate()
      } else {
        date = new Date(timestamp)
      }
      
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
    }

    // Load users when component mounts
    onMounted(async () => {
      // Try to load Firebase on startup
      const firebaseLoaded = await loadFirebase()
      if (firebaseLoaded) {
        useFirebase.value = true
      }
      
      await loadUsers()
    })

    return {
      formData,
      errors,
      successMessage,
      errorMessage,
      isSubmitting,
      savedUsers,
      useFirebase,
      submitForm,
      clearForm,
      deleteUser,
      clearAllData,
      switchDatabase,
      formatDate
    }
  }
}
</script>

<style scoped>
.user-form-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  color: #333;
  text-align: center;
  margin-bottom: 30px;
}

h2 {
  color: #333;
  margin-top: 40px;
  margin-bottom: 20px;
}

/* Database Toggle */
.database-toggle {
  background: #e9ecef;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.database-toggle label {
  display: flex;
  align-items: center;
  font-weight: bold;
  cursor: pointer;
}

.database-toggle input[type="checkbox"] {
  margin-right: 8px;
}

.info-text {
  margin: 10px 0 0 0;
  font-size: 14px;
  color: #666;
}

/* Messages */
.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 12px;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  margin-bottom: 20px;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 12px;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  margin-bottom: 20px;
}

/* Form Styles */
.user-form {
  background: #f9f9f9;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

input[type="text"],
input[type="email"],
input[type="tel"],
textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

input[type="text"]:focus,
input[type="email"]:focus,
input[type="tel"]:focus,
textarea:focus {
  outline: none;
  border-color: #007bff;
}

input.error,
textarea.error {
  border-color: #dc3545;
}

.error-text {
  color: #dc3545;
  font-size: 14px;
  margin-top: 5px;
  display: block;
}

textarea {
  resize: vertical;
  min-height: 80px;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.submit-btn {
  background-color: #007bff;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
  flex: 1;
}

.submit-btn:hover {
  background-color: #0056b3;
}

.submit-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.clear-btn {
  background-color: #6c757d;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.clear-btn:hover {
  background-color: #545b62;
}

/* Demo Actions */
.demo-actions {
  margin-top: 30px;
  text-align: center;
}

.danger-btn {
  background-color: #dc3545;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.danger-btn:hover {
  background-color: #c82333;
}

/* Saved Users */
.saved-users {
  margin-top: 40px;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.user-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.user-card h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.user-card p {
  margin: 8px 0;
  color: #555;
}

.timestamp {
  font-size: 12px;
  color: #888;
  margin-top: 15px;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;
  transition: background-color 0.3s;
}

.delete-btn:hover {
  background-color: #c82333;
}

/* Responsive */
@media (max-width: 768px) {
  .user-form-container {
    padding: 10px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .users-grid {
    grid-template-columns: 1fr;
  }
}
</style>
