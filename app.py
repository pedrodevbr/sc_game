# Step 1: Import Flask
from flask import Flask, render_template

# Step 2: Create an instance of Flask
app = Flask(__name__)

# Step 3: Define the home route
@app.route('/')
def index():
    return "hello"
    #return render_template('index.html')


# Step 4: Run the app
if __name__ == '__main__':
    app.run(debug=True)
