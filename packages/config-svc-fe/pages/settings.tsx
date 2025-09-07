// settings.tsx
import Head from "next/head";
import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, Tag, Checkbox, Spin, Alert, Modal, Form, Input, message } from "antd";
import { fetchExitConditions, 
         createExitCondition, 
         ExitConditionApiItem, 
         CreateExitConditionPayload, 
         updateExitCondition,
         deleteExitCondition 
       } from "./service";

const Settings = () => {
  const [exitConditions, setExitConditions] = useState<ExitConditionApiItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Change from visible to open
  const [isModalOpen, setIsModalOpen] = useState(false); // Renamed from isModalVisible
  const [isCreating, setIsCreating] = useState(false);
  const [form] = Form.useForm();

  const getExitConditions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchExitConditions();
      const dataWithKeys = data.map((item) => ({ ...item, key: item.id }));
      setExitConditions(dataWithKeys);
    } catch (err: any) {
      // console.error("Error fetching exit conditions in component:", err);
      setError("Failed to load exit conditions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getExitConditions();
  }, [getExitConditions]);

  const handleDefaultChange = async (record: ExitConditionApiItem, checked: boolean) => {
    const updatedRecord = { ...record, isUserDefault: checked };

    const updatedConditions = exitConditions.map((item) =>
      item.id === record.id ? updatedRecord : item
    );
    setExitConditions(updatedConditions);

    try {
      await updateExitCondition(record._key, updatedRecord);
      message.success(`Exit Condition default status updated successfully!`);
    } catch (err) {
      // console.error("Failed to update exit condition default status:", err);
      message.error("Failed to update default status. Please try again.");
      // Revert UI on error - consider a more robust way to revert if complex state.
      // For now, setting it back to the original exitConditions is fine.
      setExitConditions(exitConditions);
    }
  };

  const handleDelete = async (_key: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this exit condition?",
      okText: "Delete",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteExitCondition(_key);  // Ensure this is defined in service.ts
          message.success("Exit Condition deleted successfully!");
          await getExitConditions(); // Refresh list
        } catch (err) {
          message.error("Failed to delete exit condition. Please try again.");
        }
      }
    });
  };


  const columns = [
    {
      title: "Exit ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Text / Reason",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "Label",
      dataIndex: "label",
      key: "label",
      render: (label: string) => <Tag>{label}</Tag>,
    },
    {
      title: "Default",
      dataIndex: "isUserDefault",
      key: "default",
      render: (isUserDefault: boolean, record: ExitConditionApiItem) => (
        <Checkbox
          checked={isUserDefault}
          onChange={(e) => handleDefaultChange(record, e.target.checked)}
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: ExitConditionApiItem) => (
        record.label === "User Created" ? (
          <Button
            danger
            onClick={() => handleDelete(record._key)}
          >
            Delete
          </Button>
        ) : null
      )
    },

  ];

  const showModal = () => {
    setIsModalOpen(true); // Use isModalOpen
    form.resetFields();
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setIsCreating(true);

      const payload: CreateExitConditionPayload = {
        id: values.id,
        reason: values.reason,
        description: values.description,
        label: "User Created",
      };
      // console.log("Payload being sent:", payload);

      await createExitCondition(payload);
      message.success("Exit Condition created successfully!");
      setIsModalOpen(false); // Use isModalOpen
      form.resetFields();
      await getExitConditions();
    } catch (error: any) {
      // console.error("Failed to create exit condition:", error);
      if (error.response && error.response.data && error.response.data.message) {
        message.error(`Failed to create exit condition: ${error.response.data.message}`);
      } else {
        message.error("Failed to create exit condition. Please try again.");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false); // Use isModalOpen
    form.resetFields();
  };

  return (
    <>
      <Head>
        <title>Tazama - Configuration Service</title>
      </Head>
      <div style={{ padding: 24 }}>
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Button
            type="primary"
            style={{ backgroundColor: "blue", borderColor: "blue" }}
            onClick={showModal}
          >
            Add New Exit Condition
          </Button>
          <h2>Exit Library Page</h2>
          <div />
        </div>

        {loading && <Spin size="large" tip="Loading Exit Conditions..." />}
        {error && <Alert message="Error" description={error} type="error" showIcon />}
        {!loading && !error && (
          <Table
            columns={columns}
            dataSource={exitConditions}
            pagination={false}
            bordered
          />
        )}
      </div>

      <Modal
        title="Add New Exit Condition"
        open={isModalOpen} // Changed from visible to open
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Create"
        confirmLoading={isCreating}
        destroyOnHidden={true} // This is still technically deprecated, but often needed for form reset.
                               // The warning suggests destroyOnHidden for better performance when hidden
                               // but if you need to destroy children when closed, it's still used.
                               // If you want to strictly follow, change to destroyOnHidden if applicable.
        okButtonProps={{ style: { backgroundColor: "blue", borderColor: "blue" } }}
      >
        <Form
          form={form}
          layout="vertical"
          name="new_exit_condition"
        >
          <Form.Item
            name="id"
            label="Exit ID (e.g., .X05)"
            rules={[{ required: true, message: 'Please input the Exit ID!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="reason"
            label="Reason / Text"
            rules={[{ required: true, message: 'Please input the reason!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please input the description!' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Settings;