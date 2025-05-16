import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  message,
  Typography,
  Space,
} from "antd";

const { Title, Text } = Typography;

type Step = "otp" | "guest" | "done";

interface GuestFormValues {
  name: string;
}

const GuestForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [step, setStep] = useState<Step>("otp");
  const [selectedGuests, setSelectedGuests] = useState<number>(0);
  const [form] = Form.useForm();
  const [mobileNumber] = useState<string | undefined>(id);
  const [userFound, setUserFound] = useState<boolean>(false);
  const [_, setUserData] = useState<any>(null);

  // Fetch user and send OTP
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `http://eventapi.buddyforevents.com/api/users/${mobileNumber}`
        );

        if (response.status !== 200 || !response.data) {
          throw new Error("User not found.");
        }

        setUserFound(true);

        const otpResponse = await axios.post(
          `http://eventapi.buddyforevents.com/api/users/send-otp`,
          { mobileNumber }
        );

        if (otpResponse.status !== 200) {
          throw new Error(otpResponse.data?.message || "Failed to send OTP.");
        }
      } catch (error: any) {
        setUserFound(false);
        console.error("Fetch/send OTP error:", error);
        message.error(
          error?.response?.data?.message ||
            error.message ||
            "Error fetching user. Please try again."
        );
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  const handleOTPSubmit = async (values: { otp: string }) => {
    try {
      const { otp } = values;
      const verifyResponse = await axios.post(
        "http://eventapi.buddyforevents.com/api/users/check-otp",
        {
          mobileNumber,
          otp,
        }
      );

      if (verifyResponse.status !== 200) {
        throw new Error("OTP verification failed.");
      }

      const userResponse = await axios.get(
        `http://eventapi.buddyforevents.com/api/users/${mobileNumber}`
      );

      if (userResponse.status !== 200 || !userResponse.data) {
        throw new Error("Failed to load user after OTP verification.");
      }

      const user = userResponse.data;
      setUserData(user);
      setSelectedGuests(user.members || 0);
      form.setFieldsValue({ name: user.name });

      setStep("guest");
      message.success("OTP verified and user data loaded!");
    } catch (error: any) {
      console.error("OTP verification error:", error);
      message.error(
        error?.response?.data?.message || error.message || "Invalid OTP."
      );
    }
  };

  const handleGuestSelect = (count: number) => {
    setSelectedGuests(count);
  };

  const handleGuestFormSubmit = async (values: GuestFormValues) => {
    const result = {
      name: values.name,
      members: selectedGuests,
    };

    try {
      const response = await axios.put(
        `http://eventapi.buddyforevents.com/api/users/update/${mobileNumber}`,
        result
      );

      if (response.status !== 200) {
        throw new Error(response.data?.message || "Update failed.");
      }

      message.success("Your RSVP has been updated successfully.");
      setStep("done");
    } catch (error: any) {
      console.error("RSVP update error:", error);
      message.error(
        error?.response?.data?.message ||
          error.message ||
          "Failed to update RSVP."
      );
    }
  };

  const renderSelectableCards = () => (
    <Row gutter={16} justify="center" style={{ marginBottom: 24 }}>
      {[0, 1, 2, 3].map((num) => (
        <Col key={num}>
          <Card
            hoverable
            onClick={() => handleGuestSelect(num)}
            style={{
              width: 120,
              textAlign: "center",
              border:
                selectedGuests === num
                  ? "2px solid #1677ff"
                  : "1px solid #d9d9d9",
              backgroundColor: selectedGuests === num ? "#f0faff" : "#ffffff",
              borderRadius: 8,
              transition: "all 0.3s ease",
              boxShadow:
                selectedGuests === num
                  ? "0 0 6px rgba(22, 119, 255, 0.3)"
                  : "none",
              fontWeight: 500,
            }}
          >
            {num} {num === 1 ? "Guest" : "Guests"}
          </Card>
        </Col>
      ))}
    </Row>
  );

  return (
    <Card
      bordered={false}
      style={{
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
        borderRadius: 12,
        padding: 32,
      }}
    >
      {step === "otp" && userFound && (
        <Col span={24}>
          <Title level={3} style={{ textAlign: "center", marginBottom: 32 }}>
            Secure RSVP Access
          </Title>
          <Form onFinish={handleOTPSubmit} layout="vertical">
            <Form.Item
              label="OTP Code"
              name="otp"
              rules={[{ required: true, message: "Please enter the OTP." }]}
            >
              <Input placeholder="Enter OTP" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Verify
              </Button>
            </Form.Item>
          </Form>
        </Col>
      )}

      {step === "otp" && !userFound && (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Title level={3} style={{ textAlign: "center" }}>
            🚨 User Not Found
          </Title>
          <Text
            type="secondary"
            style={{ textAlign: "center", display: "block" }}
          >
            The mobile number you entered does not correspond to any registered
            user.
          </Text>
        </Space>
      )}

      {step === "guest" && userFound && (
        <Col span={24}>
          <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
            Confirm Your Attendance
          </Title>
          <Form form={form} onFinish={handleGuestFormSubmit} layout="vertical">
            <Form.Item
              label="Your Full Name"
              name="name"
              rules={[{ required: true, message: "Name is required." }]}
            >
              <Input placeholder="e.g., John Doe" />
            </Form.Item>

            <div style={{ marginBottom: 8 }}>
              <Text strong>How many guests will you bring?</Text>
            </div>
            {renderSelectableCards()}

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Submit RSVP
              </Button>
            </Form.Item>
          </Form>
        </Col>
      )}

      {step === "done" && (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Title level={3} style={{ textAlign: "center" }}>
            🎉 RSVP Received
          </Title>
          <Text
            type="secondary"
            style={{ textAlign: "center", display: "block" }}
          >
            Thank you for confirming. We look forward to seeing you!
          </Text>
        </Space>
      )}
    </Card>
  );
};

export default GuestForm;
