import { View, Text } from 'react-native'
import Logiclustration from '../../assets/images/logic.svg';

export default function CreateNewNote() {
  return (
    <View style={{
        padding: 20,
        marginTop: 50,
        display: 'flex',
        alignItems: 'center',
    }}>
        <View style={{
            borderWidth: 1,
            borderRadius: 15,
            padding: 25,
            marginTop: 60,
            alignItems: 'center',
            gap: 10,
        }}>
            <Logiclustration width={200} height={200} />
            <View style={{alignItems: 'center'}}>
              <Text style={{fontFamily: 'roboto'}}>Поки що тут порожньо,</Text>
              <Text style={{fontFamily: 'roboto'}}>cпало щось на думку?</Text>
              <Text style={{fontFamily: 'roboto'}}>Запишіть це</Text>
            </View>
        </View>
    </View>
  )
}

