## Beschreibung

Node.js Server zur Gruppenverwaltung und Echtzeitübertragung von Pixelkoordinaten und Benutzerinformationen über ein Socket.

## Code Beispiele



## Installation



## API-Referenz

Die Hauptpunkte entsprechen den Anfragen an den Server, die eingerückten Punkte den Antworten an den Client. Das dazugehörige JSON zeigt die erwartetet bzw. die zurückgegebenen Werte.

###reg
Registrierung eines Benutzers
> * reg  
> ``` 
> {  
>     user : 'Benutzername',  
>     pw : 'Passwort'  
> }  
> ``` 
  
>> * regSuccess  
>> ``` 
>> {  
>> }  
>> ``` 
  
>> * regFailed  
>> ``` 
>> {  
>> }  
>> ``` 
  
###auth
Login eines Benutzers
> * auth  
> ``` 
> {  
>     user : 'Benutzername',  
>     pw : 'Passwort'  
> }  
> ``` 
  
>> * authSuccess  
>> ``` 
>> {  
>>     user : 'Benutzername'  
>> }  
>> ``` 
  
>> * authFailed  
>> ``` 
>> {  
>> }  
>> ``` 
  
###createMap
Speichern einer Taktik
> * createMap  
> ``` 
> {  
>     id : 'Vom Client vergebene ID',  
>     user : 'Benutzername',  
>     map : 'Name der Map',  
>     name : 'Name der Taktik',  
>     x : '[] X-Koordinaten',  
>     y : '[] Y-Koordinaten'  
> }  
> ``` 
  
###getMaps
Gibt dem Client alle vom Benutzer gespeicherten Taktiken zurück
> * getMaps  
> ``` 
> {  
>     user : 'Benutzername'  
> }  
> ``` 
  
>> * provideMaps  
>> ``` 
>> [{  
>>     id : 'Vom Client vergebene ID',  
>>     map : 'Name der Map',  
>>     name : 'Name der Taktik',  
>>     x : '[] X-Koordinaten',  
>>     y : '[] Y-Koordinaten'  
>> }]  
>> ``` 
  
###createGroup
Registrierung einer Gruppe
> * createGroup  
> ``` 
> {  
>     user : 'Erstellender Benutzer',
>     name : 'Gruppenname',  
>     pw : 'Gruppenpasswort'  
> }  
> ``` 
  
>> * createGroupSuccess  
>> ``` 
>> {  
>> }  
>> ``` 
  
>> * createGroupFailed  
>> ``` 
>> {  
>> }  
>> ``` 
  
###authGroup
Einer Gruppe beitreten
> * authGroup  
> ``` 
> {  
>     user : 'Beitretender Benutzer',
>     name : 'Gruppenname',  
>     pw : 'Gruppenpasswort'  
> }  
> ``` 
  
>> * authGroupSuccess  
>> ``` 
>> {  
>> }  
>> ``` 
  
>> * authGroupFailed  
>> ``` 
>> {  
>> }  
>> ``` 
  
## Lizenz