import { Api } from "@mui/icons-material";

const API_Base_url =
  process.env.REACT_APP_API_BASE_URL || "https://ems-server-530056698.us-central1.run.app";//"http://localhost:8000";

const urls = {
  deleteUser: (userId) => `${API_Base_url}/delete_user/${userId}/`, //deleting user
  updateUser: (userId) => `${API_Base_url}/update_user/${userId}/`, //update the user
  fetchUser: `${API_Base_url}/fetch_users/`, //list of user shows to admin
  userCount: `${API_Base_url}/user_count/`, //total user count
  createUser: `${API_Base_url}/create_user/`, //create user
  loginUser: `${API_Base_url}/login_user/`, //for logging in
  createProject: `${API_Base_url}/create_project_manager/`, //project creation
  deleteMultiplleUser: `${API_Base_url}/delete_selected_user/`, //deleting multiple user
  totalProject: `${API_Base_url}/total_project/`, //total project count
  fetchActiveProject: `${API_Base_url}/active_project/`, //active project count
  logout: `${API_Base_url}/logout/`, //logout API
  fetchBoxList: `${API_Base_url}/get_boxes/`, //fetching boxes list that are not usedd yet
  gatewayValueData: (gatewayName) =>
    `${API_Base_url}/fetch_value_data/${gatewayName}`,

  totalGateways: `${API_Base_url}/get_all_gateways/`, //shows all gateway assigned deployed or free
  geUserProjects: (user_id) =>
    `${API_Base_url}/get_project_manager/${user_id}/`, //getting project of user
  getToalProject: `${API_Base_url}/Get_All_Projects/`, //getting the total project list for admin
  createGateway: `${API_Base_url}/create_Gateways/`, //admin create gateway
  unassignedGateway: `${API_Base_url}/get_unassigned_gateways/`, //fetch un assigneed gateway later assign to any user
  assignGateway: `${API_Base_url}/assign_gateways_to_user/`, //assigning gateway to user
  userGateways: `${API_Base_url}/fetch_gateways_of_user/`, //fetching the gateway of user with whole data and empty coms
  userlistGateways: `${API_Base_url}/fetch_gateways_of_usersList`, //user gateway dropdown in admin dashboard

  updateGateway: `${API_Base_url}/update_gateway/`, //only update the gateway status to deployed when user deploy it
  fetchDeployedGateways: `${API_Base_url}/fetch_deployed_gateways_of_user/`, //fetches only those status are deployed
  totalGatewaysCount: `${API_Base_url}/get_total_gateways/`, //total gateways count
  deployedGatewaysCount: `${API_Base_url}/get_deployed_gateways`, //deployed gateway count
  userAlotedGatewaysCount: `${API_Base_url}/get_user_aloted_gateways/`, // gateways aloted to user in admin dashboard dropdown
  fetch_Metadata: (gateway_name) =>
    `${API_Base_url}/fetch_metadata/?gateway=${gateway_name}`, //getting whole data and show in deployed gateway with coms
  fetchMetadataHighchart: (gateway_name, value_name, from_date, to_date) =>
    `${API_Base_url}/fetch_highchart_data/?gateway=${gateway_name}&value_name=${value_name}&from_date=${from_date}&to_date=${to_date}`, //high char data for specefic analyzer
  getAnalyzerValuesByGateway: (gateway_name) =>
    `${API_Base_url}/gateway/${gateway_name}/analyzers/`, //analyzers value for animation and for analyzer box dialog
  getGatewaysForDropdown: `${API_Base_url}/fetch_deployed_gateways_name_mac/`, //deployed gateway name and mac address for dropdown
};

export default urls;
