import React, { PureComponent } from "react";
import { Card, Button, Table, Modal, message } from "antd";

import { formateDate } from "../../utils/dateUtils";
import LinkButton from "../../components/link-buttom";
import { PAGE_SIZE } from "../../utils/constants";
import {reqUsers,reqDeleteUser,reqAddOrUpdateUser} from '../../api'
import UserForm from './user-form'

//用户路由
export default class User extends PureComponent {
  state = {
    users: [], //所有的用户列表
    roles:[],//所有角色列表
    isShow: false,
  };
  initColumns = () => {
    this.columns = [
      {
        title: "用户名",
        dataIndex: "username",
      },
      {
        title: "邮箱",
        dataIndex: "email",
      },
      {
        title: "电话",
        dataIndex: "phone",
      },
      {
        title: "注册时间",
        dataIndex: "create_time",
        render: formateDate,
      },
      {
        title: "所属角色",
        dataIndex: "role_id",
        //render:(role_id)=>this.state.roles.find(role => role._id===role_id ).name
        render:(role_id)=> this.roleNames[role_id]
      },
      {
        title: "操作",
        render: (user) => (
          <span>
            <LinkButton onClick={()=>this.showUpdate(user)}>修改</LinkButton>
            <LinkButton onClick={()=>this.deleteUser(user)}>删除</LinkButton>
          </span>
        ),
      },
    ];
  };
  initRoleNames = (roles) =>{
    const roleNames = roles.reduce((pre,role)=>{
        pre[role._id]=role.name 
        return pre
    },{})
    this.roleNames = roleNames
  }
  getUsers = async() =>{
      const result = await reqUsers()
      if (result.status === 0) {
        const {users,roles} = result.data
        this.initRoleNames(roles)
        this.setState({users,roles})
      }
  }
  addOrUpdateUser = async() => {
    this.setState({isShow:false})
    const user = this.form.getFieldsValue()
    this.form.resetFields()
  //   if(this.user){
  //     user._id = this.user._id
  //     const result = await reqAddOrUpdateUser(user)
  //     if(result.status===0){
  //       message.success('修改用户成功')
  //       this.getUsers()
  //     }else{
  //       message.error('修改用户失败')
  //     }
  //   }else{
  //   const result = await reqAddOrUpdateUser(user)
  //   if(result.status===0){
  //     message.success('添加用户成功')
  //     this.getUsers()
  //   }else{
  //     message.error('添加用户失败')
  //   }
  // }
  if(this.user){
    user._id = this.user._id
  }
  const result = await reqAddOrUpdateUser(user)
     if(result.status===0){
       message.success(`${user._id?'更新':'添加'}用户成功`)
       this.getUsers()
     }else{
      message.error(`${user._id?'更新':'添加'}用户失败`)
     }
  };
  showUpdate = (user) =>{
    this.user=user
    this.setState({isShow:true})
    
  }
  //显示添加界面
  showAdd = () =>{
    this.user = null
    this.setState({isShow:true})
  }
  componentWillMount() {
    this.initColumns();
  }
  deleteUser = (user) =>{
    Modal.confirm({
      title: `确定删除${user.username}吗?`,
      onOk : async ()=> {
        const result = await reqDeleteUser(user._id)
        if (result.status===0){
          message.success('删除成功')
          this.getUsers()
        }
        else{
          message.error('删除失败')
        }
      }
    })
  }
  componentDidMount(){
      this.getUsers()
  }
  render() {
    const user = this.user || {}
    const { users, isShow, roles } = this.state;
    const title = <Button type="primary" onClick={this.showAdd}>创建用户</Button>;
    return (
      <Card title={title}>
        <Table
          bordered
          rowKey="_id"
          dataSource={users}
          columns={this.columns}
          pagination={{ defaultPageSize: PAGE_SIZE }}
        />
        <Modal
          title={user._id ? '修改用户':'添加用户'}
          visible={isShow}
          onOk={this.addOrUpdateUser}
          onCancel={() =>{
            this.form.resetFields() 
            this.setState({ isShow: false }) 
          }}
        >
          <UserForm 
            setForm={(form) => (this.form = form)}
            roles={roles}
            user={user}
            />
        </Modal>
      </Card>
    );
  }
}
