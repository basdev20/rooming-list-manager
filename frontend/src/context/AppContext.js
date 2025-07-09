import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback
} from 'react';
import { authAPI, roomingListsAPI, dataAPI } from '../services/api';
import toast from 'react-hot-toast';

const AppContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: true, // Set to true for no-auth mode, can update later
  isLoading: false,

  roomingLists: [],
  filteredRoomingLists: [],
  isLoadingRoomingLists: false,

  showBookingsModal: false,
  selectedRoomingList: null,
  bookings: [],
  isLoadingBookings: false,

  filters: {
    status: 'all',
    search: '',
    sortBy: 'cutOffDate',
    sortOrder: 'asc'
  },

  showLoginModal: false,
  showRegisterModal: false
};

const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  LOGOUT: 'LOGOUT',
  SHOW_LOGIN_MODAL: 'SHOW_LOGIN_MODAL',
  SHOW_REGISTER_MODAL: 'SHOW_REGISTER_MODAL',
  HIDE_MODALS: 'HIDE_MODALS',

  SET_LOADING_ROOMING_LISTS: 'SET_LOADING_ROOMING_LISTS',
  SET_ROOMING_LISTS: 'SET_ROOMING_LISTS',
  SET_FILTERED_ROOMING_LISTS: 'SET_FILTERED_ROOMING_LISTS',

  SHOW_BOOKINGS_MODAL: 'SHOW_BOOKINGS_MODAL',
  HIDE_BOOKINGS_MODAL: 'HIDE_BOOKINGS_MODAL',
  SET_LOADING_BOOKINGS: 'SET_LOADING_BOOKINGS',
  SET_BOOKINGS: 'SET_BOOKINGS',

  SET_SEARCH: 'SET_SEARCH',
  SET_STATUS_FILTER: 'SET_STATUS_FILTER',
  SET_SORT: 'SET_SORT'
};

const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case actionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false
      };

    case actionTypes.LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        isAuthenticated: false, // ← FIXED HERE
        roomingLists: [],
        filteredRoomingLists: []
      };

    case actionTypes.SHOW_LOGIN_MODAL:
      return { ...state, showLoginModal: true, showRegisterModal: false };

    case actionTypes.SHOW_REGISTER_MODAL:
      return { ...state, showRegisterModal: true, showLoginModal: false };

    case actionTypes.HIDE_MODALS:
      return {
        ...state,
        showLoginModal: false,
        showRegisterModal: false,
        showBookingsModal: false
      };

    case actionTypes.SET_LOADING_ROOMING_LISTS:
      return { ...state, isLoadingRoomingLists: action.payload };

    case actionTypes.SET_ROOMING_LISTS:
      return {
        ...state,
        roomingLists: action.payload,
        isLoadingRoomingLists: false
      };

    case actionTypes.SET_FILTERED_ROOMING_LISTS:
      return {
        ...state,
        filteredRoomingLists: action.payload
      };

    case actionTypes.SHOW_BOOKINGS_MODAL:
      return {
        ...state,
        showBookingsModal: true,
        selectedRoomingList: action.payload.roomingList,
        bookings: action.payload.bookings,
        isLoadingBookings: false
      };

    case actionTypes.HIDE_BOOKINGS_MODAL:
      return {
        ...state,
        showBookingsModal: false,
        selectedRoomingList: null,
        bookings: [],
        isLoadingBookings: false
      };

    case actionTypes.SET_LOADING_BOOKINGS:
      return { ...state, isLoadingBookings: action.payload };

    case actionTypes.SET_BOOKINGS:
      return {
        ...state,
        bookings: action.payload,
        isLoadingBookings: false
      };

    case actionTypes.SET_SEARCH:
      return {
        ...state,
        filters: { ...state.filters, search: action.payload }
      };

    case actionTypes.SET_STATUS_FILTER:
      return {
        ...state,
        filters: { ...state.filters, status: action.payload }
      };

    case actionTypes.SET_SORT:
      return {
        ...state,
        filters: {
          ...state.filters,
          sortBy: action.payload.sortBy,
          sortOrder: action.payload.sortOrder
        }
      };

    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const applyFilters = useCallback(() => {
    let filtered = [...state.roomingLists];

    if (state.filters.status !== 'all') {
      filtered = filtered.filter(rl => rl.status === state.filters.status);
    }

    if (state.filters.search) {
      const searchLower = state.filters.search.toLowerCase();
      filtered = filtered.filter(rl =>
        rl.eventName?.toLowerCase().includes(searchLower) ||
        rl.rfpName?.toLowerCase().includes(searchLower) ||
        rl.agreement_type?.toLowerCase().includes(searchLower)
      );
    }

    filtered.sort((a, b) => {
      if (state.filters.sortBy === 'cutOffDate') {
        const dateA = new Date(a.cutOffDate);
        const dateB = new Date(b.cutOffDate);
        return state.filters.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });

    dispatch({
      type: actionTypes.SET_FILTERED_ROOMING_LISTS,
      payload: filtered
    });
  }, [state.roomingLists, state.filters]);

  const fetchRoomingLists = useCallback(async () => {
    try {
      dispatch({
        type: actionTypes.SET_LOADING_ROOMING_LISTS,
        payload: true
      });

      const response = await roomingListsAPI.getAll();

      dispatch({
        type: actionTypes.SET_ROOMING_LISTS,
        payload: response.data
      });
    } catch (error) {
      dispatch({
        type: actionTypes.SET_LOADING_ROOMING_LISTS,
        payload: false
      });

      const message =
        error.response?.data?.error || error.message || 'Failed to fetch rooming lists';
      toast.error(message);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!!token) {
      dispatch({ type: actionTypes.SET_USER, payload: { authenticated: true } });
      fetchRoomingLists();
    } else {
      dispatch({ type: actionTypes.LOGOUT });
    }
  }, [fetchRoomingLists]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const logout = useCallback(() => {
    dispatch({ type: actionTypes.LOGOUT });
    toast.success('Logged out successfully');
  }, []);

  const login = async credentials => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      const response = await authAPI.login(credentials);

      localStorage.setItem('token', response.data.token);
      dispatch({ type: actionTypes.SET_USER, payload: response.data.user });
      dispatch({ type: actionTypes.HIDE_MODALS });

      toast.success('Login successful!');
      fetchRoomingLists();

      return response.data;
    } catch (error) {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
      const message = error.response?.data?.error || error.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async userData => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      const response = await authAPI.register(userData);

      localStorage.setItem('token', response.data.token);
      dispatch({ type: actionTypes.SET_USER, payload: response.data.user });
      dispatch({ type: actionTypes.HIDE_MODALS });

      toast.success('Registration successful!');
      fetchRoomingLists();

      return response.data;
    } catch (error) {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
      const message = error.response?.data?.error || error.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const fetchBookings = useCallback(async (roomingListId, roomingList = null) => {
    try {
      if (roomingList) {
        dispatch({ type: actionTypes.SET_LOADING_BOOKINGS, payload: true });
      }

      const response = await roomingListsAPI.getBookings(roomingListId);

      if (roomingList) {
        dispatch({
          type: actionTypes.SHOW_BOOKINGS_MODAL,
          payload: {
            roomingList,
            bookings: response.data
          }
        });
      }

      return response.data;
    } catch (error) {
      if (roomingList) {
        dispatch({ type: actionTypes.SET_LOADING_BOOKINGS, payload: false });
      }
      toast.error('Failed to fetch bookings');
      throw error;
    }
  }, []);

  const insertSampleData = useCallback(async () => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });

      await dataAPI.insertSampleData();
      toast.success('Sample data inserted successfully!');
      await fetchRoomingLists();
    } catch (error) {
      const message =
        error.response?.data?.error || error.message || 'Failed to insert sample data';
      toast.error(message);
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  }, [fetchRoomingLists]);

  const value = {
    ...state,
    login,
    register,
    logout,
    fetchRoomingLists,
    fetchBookings,
    insertSampleData,
    openLoginModal: () => dispatch({ type: actionTypes.SHOW_LOGIN_MODAL }),
    openRegisterModal: () => dispatch({ type: actionTypes.SHOW_REGISTER_MODAL }),
    hideModals: () => dispatch({ type: actionTypes.HIDE_MODALS }),
    hideBookingsModal: () => dispatch({ type: actionTypes.HIDE_BOOKINGS_MODAL }),
    setSearch: search => dispatch({ type: actionTypes.SET_SEARCH, payload: search }),
    setStatusFilter: status => dispatch({ type: actionTypes.SET_STATUS_FILTER, payload: status }),
    setSort: (sortBy, sortOrder) =>
      dispatch({ type: actionTypes.SET_SORT, payload: { sortBy, sortOrder } })
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
