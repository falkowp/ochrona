import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function UserProfile() {
    const [username, setUsername] = useState("");
    const [messageCount, setMessageCount] = useState(0);
    const [view, setView] = useState("profile"); // 'profile', 'changePassword', 'otpVerification'

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [otp, setOtp] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const token = localStorage.getItem("jwtToken");

    // Pobranie danych u¿ytkownika
    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            setUsername(payload.username);

            fetch(`/api/user/message_count`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    setMessageCount(data.messageCount || 0);
                })
                .catch((error) => console.error("Error fetching message count:", error));
        } catch (error) {
            console.error("Invalid token:", error);
            navigate("/login");
        }
    }, [token, navigate]);

    // Obs³uga zmiany has³a (krok 1)
    const handleChangePasswordStep1 = (e) => {
        e.preventDefault();

        if (newPassword !== confirmNewPassword) {
            setError("New passwords do not match.");
            return;
        }

        setView("otpVerification");
        setError("");
    };

    // Obs³uga weryfikacji OTP i zmiany has³a (krok 2)
    const handleChangePasswordStep2 = (e) => {
        e.preventDefault();

        fetch(`/api/change_password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                current_password: oldPassword,
                otp: otp,
                new_password: newPassword,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.message === "Password changed successfully.") {
                    setSuccess("Password updated successfully.");
                    setView("profile");
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmNewPassword("");
                    setOtp("");
                } else {
                    setError(data.message || "Failed to change the password.");
                }
            })
            .catch((error) => {
                setError("Error changing password.");
                console.error("Error:", error);
            });
    };

    // Anulowanie i powrót do widoku profilu
    const handleCancel = () => {
        setView("profile");
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setOtp("");
        setError("");
        setSuccess("");
    };

    return (
        <div className="user-profile-container">
            {view === "profile" && (
                <>
                    <h1>User Profile</h1>
                    <p><strong>Username:</strong> {username}</p>
                    <p><strong>Currently published messages:</strong> {messageCount}</p>
                    <button onClick={() => setView("changePassword")}>Change Password</button>
                    {success && <p className="success-message">{success}</p>}
                </>
            )}

            {view === "changePassword" && (
                <form onSubmit={handleChangePasswordStep1} className="change-password-form">
                    <h2>Change Password</h2>
                    <label>
                        Old Password:
                        <input
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        New Password:
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Confirm New Password:
                        <input
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            required
                        />
                    </label>
                    {error && <p className="error-message">{error}</p>}
                    <div>
                        <button type="submit">Next</button>
                        <button type="button" onClick={handleCancel}>Cancel</button>
                    </div>
                </form>
            )}

            {view === "otpVerification" && (
                <form onSubmit={handleChangePasswordStep2} className="otp-verification-form">
                    <h2>OTP Verification</h2>
                    <label>
                        Enter OTP:
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                    </label>
                    {error && <p className="error-message">{error}</p>}
                    <div>
                        <button type="submit">Submit</button>
                        <button type="button" onClick={handleCancel}>Cancel</button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default UserProfile;
