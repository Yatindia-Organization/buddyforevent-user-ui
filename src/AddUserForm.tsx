import { useState } from "react";
import { Form, Input, Button, Modal, message, Typography } from "antd";
import { CopyOutlined } from "@ant-design/icons";

const { Paragraph } = Typography;

const AddUserForm = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [guestLink, setGuestLink] = useState("");

  const handleFinish = async (values: any) => {
    try {
      const response = await fetch(
        "http://eventapi.buddyforevents.com/api/users/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Show error from API or fallback to generic message
        message.error(data?.message || "Failed to add user. Please try again.");
        return;
      }

      const link = `http://event.buddyforevents.com/guest/${data.user.mobileNumber}`;
      setGuestLink(link);
      setModalVisible(true);
      form.resetFields();
    } catch (err: any) {
      message.error(err.message || "Server error. Please try again later.");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(guestLink);
      message.success("Link copied to clipboard!");
    } catch {
      message.error("Failed to copy");
    }
  };

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        style={{ maxWidth: 400, margin: "0 auto", paddingTop: "2rem" }}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Please enter the name" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Mobile Number"
          name="mobileNumber"
          rules={[
            { required: true, message: "Please enter a mobile number" },
            {
              pattern: /^\d{10}$/,
              message: "Mobile number must be 10 digits",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
            Submit
          </Button>
          <Button htmlType="button" onClick={() => form.resetFields()}>
            Reset
          </Button>
        </Form.Item>
      </Form>

      <Modal
        title="User Added Successfully"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button
            key="copy"
            type="primary"
            icon={<CopyOutlined />}
            onClick={handleCopy}
          >
            Copy Link
          </Button>,
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>,
        ]}
      >
        <Paragraph copyable={{ text: guestLink }}>{guestLink}</Paragraph>
      </Modal>
    </>
  );
};

export default AddUserForm;
