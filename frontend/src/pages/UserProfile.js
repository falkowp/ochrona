import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";

function UserProfile() {
    const [username, setUsername] = useState("");
    const [messageCount, setMessageCount] = useState(0);
    const [view, setView] = useState("profile"); 

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [otp, setOtp] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const token = localStorage.getItem("jwtToken");

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

    const handleChangePasswordStep1 = (e) => {
        e.preventDefault();

        if (newPassword !== confirmNewPassword) {
            setError("New passwords do not match.");
            return;
        }

        setView("otpVerification");
        setError("");
    };

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
                    <h1 className="user-profile-container__header">User Profile</h1>
                    <p className="user-profile-container__data"><strong>Username:</strong> {username}</p>
                    <p className="user-profile-container__data"><strong>Currently published messages:</strong> {messageCount}</p>
                    <button className="user-profile-container__button" onClick={() => setView("changePassword")}>Change Password</button>
                    {success && <p className="user-profile-success-message">{success}</p>}
                </>
            )}

            {view === "changePassword" && (
                <form onSubmit={handleChangePasswordStep1} className="user-profile-change-password-form">
                    <h2 className="user-profile-change-password-form__header">Change Password</h2>
                    <label className="user-profile-change-password-form__label">
                        Old Password:
                        <input
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="user-profile-change-password-form__input"
                            required
                        />
                    </label>
                    <label className="user-profile-change-password-form__label">
                        New Password:
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="user-profile-change-password-form__input"
                            required
                        />
                    </label>
                    <label className="user-profile-change-password-form__label">
                        Confirm New Password:
                        <input
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className="user-profile-change-password-form__input"
                            required
                        />
                    </label>
                    {error && <p className="user-profile-error-message">{error}</p>}
                    <div>
                        <button type="submit" className="user-profile-container__button">Next</button>
                        <button type="button" onClick={handleCancel} className="user-profile-cancel-button">Cancel</button>
                    </div>
                </form>
            )}

            {view === "otpVerification" && (
                <form onSubmit={handleChangePasswordStep2} className="user-profile-otp-verification-form">
                    <h2 className="user-profile-otp-verification-form__header">Verification</h2>
                    <label className="user-profile-otp-verification-form__label">
                        Enter authorization key:
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="user-profile-otp-verification-form__input"
                            required
                        />
                    </label>
                    {error && <p className="user-profile-error-message">{error}</p>}
                    <div>
                        <button type="submit" className="user-profile-container__button">Submit</button>
                        <button type="button" onClick={handleCancel} className="user-profile-cancel-button">Cancel</button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default UserProfile;
