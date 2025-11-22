const checkLogin = async () => {
    try {
        const loginUrl = "http://localhost:5000/auth/login";
        const credentials = {
            email: "manager1@gmail.com",
            password: "123456" // Default password from seed
        };

        console.log(`Attempting login to ${loginUrl}...`);
        const response = await fetch(loginUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials)
        });

        if (response.ok) {
            const data = await response.json();
            console.log("✅ Login Successful!");
            console.log("   Token received:", data.token ? "Yes" : "No");
            console.log("   User Role:", data.user.role);
        } else {
            console.log(`❌ Login Failed: ${response.status} ${response.statusText}`);
            const errorText = await response.text();
            console.log("   Error:", errorText);
        }
    } catch (error) {
        console.error("❌ Network/Server Error:", error.message);
    }
};

checkLogin();
