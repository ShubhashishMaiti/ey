import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./App.css";
import Menu from "./Menu";
import Copyright from "./Copyright";

const Chatbot_interface = () => {
	const [inputText, setInputText] = useState([]);
	const [chatHistory, setChatHistory] = useState([]);
	const [userResponse, setUserResponse] = useState("");
	const [description, setdescription] = useState([]);
	const chatContainerRef = useRef(null);
	const [imageFile, setImageFile] = useState(null);
	var enter = true;
	const handleImageChange = (event) => {
		const file = event.target.files[0];
		setImageFile(file);
	};

	function isImageLink(text) {
		console.log(text);
		return text?.match(/\.(jpeg|jpg|gif|png|yes)$/) != null;
	}
	const handlenegativeprompt = async () => {
		setChatHistory((prevChatHistory) => [
			...prevChatHistory,
			{
				text: "Did you disliked any of the component of the images?",
				user: false,
				ig: "no",
			},
		]);
	};

	const handleUpload = async () => {
		// if (!imageFile) {
		// 	console.log("No image selected.");
		// 	return;
		// }

		const formData = new FormData();
		formData.append("image", imageFile);
		formData.append("description", description);
		// console.log(description);
		setdescription("");
		setChatHistory((prevChatHistory) => [
			...prevChatHistory,
			{ text: "Uploaded", user: true, ig: "no" },
		]);
		try {
			const response = await fetch("https://flask-app-ey.onrender.com/upload", {
				method: "POST",
				body: formData,
			});

			const data = await response.json();
			setChatHistory((prevChatHistory) => [
				...prevChatHistory,
				{ text: data.text, user: false, ig: data.ig },
			]);
			console.log("Image uploaded:", data);
		} catch (error) {
			console.error("Error uploading image:", error);
		}
	};
	const sendRequest = async () => {
		if (inputText.trim() === "") return;
		setChatHistory([
			...chatHistory,
			{ text: inputText, user: true, ig: "false" },
		]);
		var val = inputText;
		setInputText("");
		var response;
		if (val.indexOf("my preferences") !== -1) {
			response = await fetch("http://127.0.0.1:5000/read_file");
		} else if (val.indexOf("remember that") !== -1) {
			response = await fetch("http://127.0.0.1:5000/write_to_file", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ data: inputText }),
			});
		} else {
			response = await fetch(
				`https://flask-app-ey.onrender.com/answer/${encodeURIComponent(
					inputText
				)}`
			);
		}

		var data = await response.json();
		// if(inputText==="Suggest me some spicy packed food retail mrp items")
		// {
		// 	setChatHistory((prevChatHistory) => [
		// 		...prevChatHistory,
		// 		{ text: data.text, user: false, ig: data.ig },
		// 	]);

		// }
		setChatHistory((prevChatHistory) => [
			...prevChatHistory,
			{ text: data.text, user: false, ig: data.ig },
		]);
		if (
			data.response_key === "body_shape" ||
			data.response_key === "age" ||
			data.response_key === "place"
		) {
			const response = val;
			setUserResponse(response);

			const saveResponse = await fetch("http://127.0.0.1:5000/save_response", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					data: response,
					response_key: data.response_key,
				}),
			});
		}
		// console.log(data.text);
		if (data.response_key === "place") {
			const r = await await fetch(
				"https://flask-app-ey.onrender.com/description",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						data: response,
						response_key: data.response_key,
					}),
				}
			);
			const d = await r.json();
			setChatHistory((prevChatHistory) => [
				...prevChatHistory,
				{ text: d.text, user: false, ig: d.ig },
			]);
		}
	};

	useEffect(() => {
		chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
	}, [chatHistory]);

	return (
		<div>
			<Menu />
			<div className="App">
				<div className="left-panel">
					<div className="welcome-message">
						Experience the magic of a personalized journey with our EY
						RetailBot.
					</div>
				</div>
				<div className="right-panel">
					<div className="chat-container" ref={chatContainerRef}>
						{chatHistory.map((message, index) => (
							<div
								key={index}
								className={`message ${message.user ? "user" : "bot"}`}
							>
								{isImageLink(message.ig) ? (
									<div>
										{message.ig === "yes.jpg" ? (
											<div></div>
										) : (
											<img
												src={message.ig}
												alt="preview"
												className="image-response"
											/>
										)}
										<p className="latest-trends-text">{message.text}</p>
										{message.text ===
										"Could you kindly share some information about your body shape?" ? (
											<p></p>
										) : (
											<div>
												<Link to="/shop" className="buy-now-link">
													Buy now!
												</Link>
											</div>
										)}
									</div>
								) : (
									<div className="message-text">{message.text}</div>
								)}
							</div>
						))}
					</div>

					<div className="input-container">
						<input
							type="text"
							value={description}
							onChange={(e) => setdescription(e.target.value)}
							placeholder="Enter description..."
						/>
						<input
							type="file"
							accept="image/*"
							className="input"
							onChange={handleImageChange}
						/>
						<button className="upload-button" onClick={handleUpload}>
							Upload Image
						</button>
					</div>

					<div className="input-container">
						<input
							type="text"
							value={inputText}
							onChange={(e) => setInputText(e.target.value)}
							placeholder="Type your message..."
						/>
						<div />
						<button onClick={sendRequest}>Send</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Chatbot_interface;
