import React, { Component } from "react";
import { Card, Select, Input, Button, Icon, Table, message } from "antd";

import LinkButton from "../../../components/link-buttom";
import { PAGE_SIZE } from "../../../utils/constants";
import { reqProducts, reqSearchProducts, reqUpdateStatus } from "../../../api";
const Option = Select.Option;

export default class ProductHome extends Component {
  state = {
    products: [], //商品数组
    total: 0,
    loading: false,
    searchName: "",
    searchType: "productName",
  };
  //初始化table列的数组
  initColums = () => {
    this.columns = [
      {
        title: "商品名称",
        dataIndex: "name",
      },
      {
        title: "商品描述",
        dataIndex: "desc",
      },
      {
        title: "价格",
        dataIndex: "price",
        render: (price) => "¥" + price,
      },
      {
        width: 100,
        title: "状态",
        //dataIndex: "status",
        render: (product) => {
          const { status, _id } = product;
          return (
            <span>
              <Button
                type="primary"
                onClick={() => {
                  this.updateStatus(_id, status === 1 ? 2 : 1);
                }}
              >
                {status === 1 ? "下架" : "上架"}
              </Button>
              <span>{status === 1 ? "在售" : "已下架"}</span>
            </span>
          );
        },
      },
      {
        width: 100,
        title: "操作",
        render: (product) => {
          return (
            <span>
              {/* 将product对象使用state传递给目标路由组件*/}
              <LinkButton
                onClick={() =>
                  this.props.history.push("/product/detail", product)
                }
              >
                详情
              </LinkButton>
              <LinkButton
                onClick={() =>
                  this.props.history.push("/product/addupdate", product)
                }
              >
                修改
              </LinkButton>
            </span>
          );
        },
      },
    ];
  };
  getProducts = async (pageNum) => {
    this.pageNum = pageNum;
    this.setState({ loading: true });
    const { searchName, searchType } = this.state;
    const pageSize = PAGE_SIZE;
    var result;
    if (searchName) {
      result = await reqSearchProducts({
        pageNum,
        pageSize,
        searchName,
        searchType,
      });
    } else {
      result = await reqProducts(pageNum, pageSize);
    }
    this.setState({ loading: false });

    if (result.status === 0) {
      //取出分页数据，更新状态，显示分页列表
      const { total, list } = result.data;
      this.setState({ total, products: list });
    }
  };
  updateStatus = async (productId, status) => {
    const result = await reqUpdateStatus(productId, status);
    if (result.status === 0) {
      message.success("更新商品成功");
      this.getProducts(this.pageNum);
    }
  };
  componentWillMount() {
    this.initColums();
  }
  componentDidMount() {
    this.getProducts(1);
  }

  render() {
    const { products, total, loading, searchName, searchType } = this.state;

    const title = (
      <span>
        <Select
          value={searchType}
          style={{ width: 150 }}
          onChange={(value) => this.setState({ searchType: value })}
        >
          <Option value="productName">按名称搜索</Option>
          <Option value="productDesc">按描述搜索</Option>
        </Select>
        <Input
          placeholder="关键字"
          style={{ width: 200, margin: "0 10px" }}
          value={searchName}
          onChange={(event) =>
            this.setState({ searchName: event.target.value })
          }
        />
        <Button type="primary" onClick={() => this.getProducts(1)}>
          搜索
        </Button>
      </span>
    );
    const extra = (
      <Button
        type="primary"
        onClick={() => {
          this.props.history.push("/product/addupdate");
        }}
      >
        <Icon type="plus"></Icon>
        添加商品
      </Button>
    );
    return (
      <Card title={title} extra={extra}>
        <Table
          loading={loading}
          bordered
          rowKey="_id"
          dataSource={products}
          columns={this.columns}
          pagination={{
            current:this.pageNum,
            onChange: this.getProducts,
            total,
            defaultPageSize: PAGE_SIZE,
            showQuickJumper: true,
          }}
        />
        ;
      </Card>
    );
  }
}
