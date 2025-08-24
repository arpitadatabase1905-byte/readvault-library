body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  background: #f9f9f9;
}

header {
  background: #333;
  color: white;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

nav button {
  background: #555;
  color: white;
  border: none;
  padding: 8px 15px;
  margin-left: 5px;
  cursor: pointer;
  border-radius: 5px;
}

nav button:hover {
  background: #777;
}

main {
  padding: 20px;
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.book-card {
  background: white;
  padding: 10px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0px 2px 5px rgba(0,0,0,0.1);
}

.book-card img {
  width: 100px;
  height: 150px;
  object-fit: cover;
}

.book-card button {
  margin-top: 5px;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.edit-btn {
  background: #007bff;
  color: white;
}

.delete-btn {
  background: #dc3545;
  color: white;
}
