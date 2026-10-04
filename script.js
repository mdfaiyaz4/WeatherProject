import { GoogleGenAI } from "@google/genai";




const WEATHER_API_KEY =
    "YOUR_WEATHER_API_KEY";

const GEMINI_API_KEY =
    "YOUR_GEMINI_API_KEY";




const ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY
});



let weatherContext =
    "No weather context available yet.";




const cityElement =
    document.getElementById("city");

const tempElement =
    document.getElementById("temp");

const descElement =
    document.getElementById("desc");

const chatPopup =
    document.getElementById("chatPopup");

const chatMessages =
    document.getElementById("chatMessages");

const userInput =
    document.getElementById("userInput");



async function fetchWeather() {

    if (!navigator.geolocation) {

        descElement.innerText =
            "Geolocation is not supported.";

        return;
    }


    navigator.geolocation.getCurrentPosition(
        async (position) => {

            const {
                latitude,
                longitude
            } = position.coords;


            try {

                const url =
                    `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${latitude},${longitude}`;


                const response =
                    await fetch(url);


                if (!response.ok) {
                    throw new Error(
                        "Weather API request failed."
                    );
                }


                const data =
                    await response.json();


                

                cityElement.innerText =
                    data.location.name;


                tempElement.innerText =
                    `${Math.round(data.current.temp_c)}°C`;


                descElement.innerText =
                    data.current.condition.text;


             

                weatherContext =
                    `The user is in ${data.location.name}.
                    Current temperature: ${data.current.temp_c}°C.
                    Sky condition: ${data.current.condition.text}.
                    Humidity: ${data.current.humidity}%.
                    Feels like: ${data.current.feelslike_c}°C.`;



                const condition =
                    data.current.condition.text.toLowerCase();


                const isDay =
                    data.current.is_day;


                document.body.classList.remove(
                    "sunny",
                    "cloudy",
                    "rainy",
                    "night"
                );


                if (!isDay) {

                    document.body.classList.add(
                        "night"
                    );

                } else if (
                    condition.includes("sun") ||
                    condition.includes("clear")
                ) {

                    document.body.classList.add(
                        "sunny"
                    );

                } else if (
                    condition.includes("cloud") ||
                    condition.includes("overcast")
                ) {

                    document.body.classList.add(
                        "cloudy"
                    );

                } else if (
                    condition.includes("rain") ||
                    condition.includes("drizzle")
                ) {

                    document.body.classList.add(
                        "rainy"
                    );
                }

            } catch (error) {

                console.error(
                    "Weather Error:",
                    error
                );

                descElement.innerText =
                    "Error fetching weather.";
            }
        },


        (error) => {

            console.error(
                "Location Error:",
                error
            );

            descElement.innerText =
                "Location access denied.";
        }
    );
}



document
    .getElementById("toggleBtn")
    .addEventListener("click", () => {

        chatPopup.style.display = "flex";

        userInput.focus();
    });


/* =========================
   CLOSE CHAT
========================= */

document
    .getElementById("closeBtn")
    .addEventListener("click", () => {

        chatPopup.style.display = "none";
    });




function addMessage(
    message,
    className
) {

    const messageElement =
        document.createElement("div");


    messageElement.classList.add(
        className
    );


    

    messageElement.textContent =
        message;


    chatMessages.appendChild(
        messageElement
    );


    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}



async function handleChat() {

    const text =
        userInput.value.trim();


    if (!text) {
        return;
    }



    addMessage(
        text,
        "user-msg"
    );


    userInput.value = "";


    try {

        const result =
            await ai.models.generateContent({

                model: "gemini-2.5-flash",

                contents: [
                    {
                        role: "user",

                        parts: [
                            {
                                text:
                                    `You are a helpful weather assistant.

Use the following current weather information when answering.

Weather Context:
${weatherContext}

User Question:
${text}`
                            }
                        ]
                    }
                ]
            });


        const responseText =
            result.text;


        addMessage(
            responseText,
            "ai-msg"
        );


    } catch (error) {

        console.error(
            "Gemini Error:",
            error
        );


        addMessage(
            `Error: ${error.message}`,
            "ai-msg"
        );
    }
}


/* =========================
   SEND BUTTON
========================= */

document
    .getElementById("sendBtn")
    .addEventListener(
        "click",
        handleChat
    );


userInput.addEventListener(
    "keypress",
    (event) => {

        if (event.key === "Enter") {

            handleChat();
        }
    }
);




fetchWeather();
