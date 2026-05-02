import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { ConfirmedBooking } from './BookingsContext';
import { QuasarCategory, StaffMember } from './quasarData';

export type RescheduleParams = {
  bookingId: string;
  stylist?: StaffMember;
  dateIso?: string;
  timeSlot?: string;
};

export type RootStackParamList = {
  MainTabs: { screen?: keyof TabParamList } | undefined;
  Category: { category: QuasarCategory };
  Cart: undefined;
  Booking: { reschedule?: RescheduleParams } | undefined;
  BookingSuccess: { booking: ConfirmedBooking };
  Login: undefined;
  SignUp: undefined;
  OTP: { email: string; phone?: string };
  Admin: undefined;
  EditProfile: undefined;
  DeleteAccount: undefined;
  HelpContact: undefined;
  PrivacyPolicy: undefined;
  Terms: undefined;
};

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Bookings: undefined;
  Profile: undefined;
};

export type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type SearchScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Search'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type MyBookingsScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Bookings'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type ProfileScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type CategoryScreenProps = NativeStackScreenProps<RootStackParamList, 'Category'>;
export type CartScreenProps = NativeStackScreenProps<RootStackParamList, 'Cart'>;
export type BookingScreenProps = NativeStackScreenProps<RootStackParamList, 'Booking'>;
export type BookingSuccessScreenProps = NativeStackScreenProps<RootStackParamList, 'BookingSuccess'>;
export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type SignUpScreenProps = NativeStackScreenProps<RootStackParamList, 'SignUp'>;
export type OTPScreenProps = NativeStackScreenProps<RootStackParamList, 'OTP'>;
export type EditProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;
export type DeleteAccountScreenProps = NativeStackScreenProps<RootStackParamList, 'DeleteAccount'>;
export type HelpContactScreenProps = NativeStackScreenProps<RootStackParamList, 'HelpContact'>;
export type PrivacyPolicyScreenProps = NativeStackScreenProps<RootStackParamList, 'PrivacyPolicy'>;
export type TermsScreenProps = NativeStackScreenProps<RootStackParamList, 'Terms'>;
