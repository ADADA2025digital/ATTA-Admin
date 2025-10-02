import React, { useState } from "react";
import "../assets/Styles/Style.css";
import Profile from "../assets/Images/profile.png";
import InputField from "../Components/InputField";
import ButtonGlobal from "../Components/Button";
import TextAreaField from "../Components/TextAreaField";
import DropdownField from "../Components/DropdownField";

const UserAccount = () => {
  const [formData, setFormData] = useState({
    company: "",
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    aboutMe: "",
    url: "",
    password: "",
    bio: "",
  });

  const [errors, setErrors] = useState({});

  // 🔹 Regex Patterns
  const regexPatterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Valid email format
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/, // Min 8 chars, 1 uppercase, 1 lowercase, 1 digit
    url: /^(https?:\/\/)[^\s$.?#].[^\s]*$/, // Valid website URL
    bio: /^.{0,150}$/, // Max 150 characters
  };

  // 🔥 Dynamic Field Validation
  const validateField = (name, value) => {
    let errorMessage = "";

    if (name in regexPatterns && !regexPatterns[name].test(value)) {
      switch (name) {
        case "email":
          errorMessage = "Enter a valid email (e.g. user@example.com)";
          break;
        case "password":
          errorMessage =
            "Password must be 8+ characters with uppercase, lowercase, and number";
          break;
        case "url":
          errorMessage = "Enter a valid URL (http:// or https:// required)";
          break;
        case "bio":
          errorMessage = "Bio cannot exceed 150 characters";
          break;
        default:
          break;
      }
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: errorMessage,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let valid = true;
    Object.keys(formData).forEach((field) => {
      if (!formData[field] && field !== "bio") {
        valid = false;
        validateField(field, formData[field]);
      }
    });

    if (valid) {
      alert("Form submitted successfully!");
    } else {
      alert("Please fix the errors before submitting.");
    }
  };

  return (
    <div className="user-account container m-0">
      <div className="row p-4">
        <div className="col-md-4 p-0">
          <div className="card">
            <div
              className="card-header"
              style={{ color: "#7a70ba", borderBottom: "2px dotted #7a70ba" }}
            >
              <h4 className="fw-bold m-0">My Profile</h4>
            </div>
            <div className="card-body p-3">
              <div className="row d-flex align-items-center justify-content-center text-center">
                <img
                  src={Profile}
                  alt="User"
                  style={{ height: "100px", width: "130px" }}
                />
                <h6 className="fw-bold m-0">EMILY JECNO</h6>
                <p className="text-muted m-0">DESIGNER</p>
              </div>

              <form className="py-0" onSubmit={handleSubmit}>
                {/* Bio */}
                <TextAreaField
                  label="Bio"
                  id="bio"
                  name="bio"
                  placeholder="Write about yourself..."
                  rows="3"
                  value={formData.bio}
                  onChange={handleChange}
                  error={errors.bio}
                  required
                />

                {/* Email */}
                <InputField
                  label="Email-Address"
                  type="email"
                  id="email"
                  name="email"
                  placeholder="your-email@domain.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                />

                {/* Password */}
                <InputField
                  label="Password"
                  type="password"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  required
                />

                {/* Website URL */}
                <InputField
                  label="Website"
                  type="url"
                  id="url"
                  name="url"
                  placeholder="http://yourwebsite.com"
                  value={formData.url}
                  onChange={handleChange}
                  error={errors.url}
                  required
                />

                {/* Submit Button */}
                <div
                  className="text-center py-3"
                  style={{ color: "#7a70ba", borderTop: "2px dotted #7a70ba" }}
                >
                  <ButtonGlobal
                    type="submit"
                    text="Save"
                    className="btn text-white"
                    style={{ backgroundColor: "#7a70ba", width: "100%" }}
                  />
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-8 card p-0">
          <div
            className="card-header mb-3"
            style={{ color: "#7a70ba", borderBottom: "2px dotted #7a70ba" }}
          >
            <h4 className="fw-bold m-0">Edit Profile</h4>
          </div>
          <div className="card-body p-3">
            <form>
              <div className="row">
                {/* Company */}
                <div className="col-md-4">
                  <InputField
                    label="Company"
                    type="text"
                    name="company"
                    placeholder="Company"
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>

                {/* Username */}
                <div className="col-md-4">
                  <InputField
                    label="Username"
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>

                {/* Email */}
                <div className="col-md-4">
                  <InputField
                    label="Email address"
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row">
                {/* First Name */}
                <div className="col-md-6">
                  <InputField
                    label="First Name"
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>

                {/* Last Name */}
                <div className="col-md-6">
                  <InputField
                    label="Last Name"
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Address */}
              <TextAreaField
                label="Address"
                name="address"
                placeholder="Home Address"
                rows="2"
                value={formData.address}
                onChange={handleChange}
              />

              <div className="row">
                {/* City */}
                <div className="col-md-4">
                  <InputField
                    label="City"
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>

                {/* Postal Code */}
                <div className="col-md-4">
                  <InputField
                    label="Postal Code"
                    type="text"
                    name="postalCode"
                    placeholder="ZIP Code"
                    value={formData.postalCode}
                    onChange={handleChange}
                  />
                </div>

                {/* Country */}
                <div className="col-md-4">
                  <DropdownField
                    label="Country"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    options={["Option 1", "Option 2", "Option 3"]}
                    required={true}
                  />
                </div>
              </div>

              {/* About Me */}
              <TextAreaField
                label="About Me"
                name="aboutMe"
                placeholder="Enter About your description"
                rows="3"
                value={formData.aboutMe}
                onChange={handleChange}
              />

              {/* Submit Button */}
              <div
                className="text-center py-3"
                style={{ color: "#7a70ba", borderTop: "2px dotted #7a70ba" }}
              >
                <ButtonGlobal
                  type="submit"
                  text="Update"
                  className="btn text-white"
                  style={{ backgroundColor: "#7a70ba", width: "100%" }}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAccount;