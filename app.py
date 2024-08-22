from flask import Flask, render_template, request, jsonify
from transformers import pipeline, AutoProcessor, AutoModelForVisualQuestionAnswering
from PIL import Image
from torchvision import transforms
from werkzeug.utils import secure_filename
import os

pipe = pipeline("visual-question-answering", model="Salesforce/blip-vqa-capfilt-large", device="cuda", clean_up_tokenization_spaces=True)
processor = AutoProcessor.from_pretrained("Salesforce/blip-vqa-capfilt-large")
model = AutoModelForVisualQuestionAnswering.from_pretrained("Salesforce/blip-vqa-capfilt-large")

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads/'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/")
def index():
    return render_template('chat.html')


@app.route("/get", methods=["GET", "POST"])
def chat():
    msg = request.form["msg"]
    file_path = None
    uploaded_file_info = None

    if 'file' in request.files:
        file = request.files['file']

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            uploaded_file_info = f"File uploaded: {filename}"
        else:
            uploaded_file_info = "Invalid file type."

    response_text = get_Chat_response(msg, file_path)

    full_response = response_text
    if uploaded_file_info:
        full_response += f" ({uploaded_file_info})"

    return full_response


def get_Chat_response(text, file_path=None):
    if file_path:
        image = Image.open(file_path).convert("RGB")

        transform = transforms.Compose([
            transforms.Resize((180, 180)),
            transforms.CenterCrop(120)
        ])

        input_image = transform(image)

        inputs = processor(images=input_image, text=text, return_tensors="pt")
    else:
        return "No image provided for visual question answering."

    outputs = model.generate(**inputs, max_new_tokens=200)
    return processor.decode(outputs[0], skip_special_tokens=True)


if __name__ == '__main__':
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.run()
