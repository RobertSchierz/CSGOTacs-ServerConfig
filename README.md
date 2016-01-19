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
>     group : 'Gruppenname (Falls Gruppentaktik)',  
>     drag : '[] Bestimmt für jede Koordinate ob sie Punkt oder Teil einer Linie ist',  
>     x : '[] X-Koordinaten',  
>     y : '[] Y-Koordinaten'  
> }  
> ``` 
  
  
>> * createMapSuccess  
>> ``` 
>> {  
>> }  
>> ``` 
  
>> * deleteMapFailed  
>> ``` 
>> {  
>> }  
>> ``` 
  
###changeMap
Ändern einer Taktik
> * changeMap  
> ``` 
> {  
>     id : 'ID der Taktik',  
>     drag : '[] Bestimmt für jede Koordinate ob sie Punkt oder Teil einer Linie ist',  
>     x : '[] X-Koordinaten',  
>     y : '[] Y-Koordinaten'  
> }  
> ``` 
  
>> * changeMapSuccess  
>> ``` 
>> {  
>> }  
>> ``` 
  
>> * changeMapFailed  
>> ``` 
>> {  
>> }  
>> ``` 
  
###deleteMap
Löschen einer Taktik
> * deleteMap  
> ``` 
> {  
>     id : 'ID der Taktik'
> }  
> ``` 
  
>> * deleteMapSuccess  
>> ``` 
>> {  
>> }  
>> ``` 
  
>> * deleteMapFailed  
>> ``` 
>> {  
>> }  
>> ``` 
  
###getMaps
Gibt dem Client alle vom Benutzer gespeicherten Taktiken zurück
> * getMaps  
> ``` 
> {  
>     user : 'Benutzername'  
>     ODER  
>     group : 'Gruppenname'  
> }  
> ``` 
  
>> * provideMaps  
>> ``` 
>> [{  
>>     id : 'Vom Client vergebene ID',  
>>     map : 'Name der Map',  
>>     name : 'Name der Taktik',  
>>     group : 'Name der Gruppe (Falls Gruppentaktik)',  
>>     drag : '[] Bestimmt für jede Koordinate ob sie Punkt oder Teil einer Linie ist',  
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
>>    member : '[] Gruppenmitglieder',  
>>    admin : 'Guppenadministrator',  
>>    mods : '[] Gruppenmoderatoren'  
>> }  
>> ``` 
  
>> * authGroupFailed  
>> ``` 
>> {  
>> }  
>> ``` 
  
###getGroups
Gibt dem Client alle Gruppen des Benutzers zurück
> * getGroups  
> ``` 
> {  
>     user : 'Benutzername'  
> }  
> ``` 
  
>> * provideGroups  
>> ``` 
>> {[  
>>    name : 'Gruppenname',  
>>    member : '[] Gruppenmitglieder',  
>>    admin : 'Guppenadministrator',  
>>    mods : '[] Gruppenmoderatoren'  
>> ]}  
>> ``` 
  
###leaveGroup
Eine Gruppe verlassen
> * leaveGroup  
> ``` 
> {  
>     user : 'Benutzername',  
>     name : 'Gruppenname'  
> }  
> ``` 
  
>> * leaveGroupSuccess  
>> ``` 
>> {  
>> }  
>> ``` 
  
>> * leaveGroupFailed  
>> ``` 
>> {  
>> }  
>> ``` 
  
###setGroupMod
Einen Benutzer zum Moderator machen
> * setGroupMod  
> ``` 
> {  
>     user : 'Name des zum Moderator werdenden Benutzers',  
>     name : 'Gruppenname'  
> }  
> ``` 
  
>> * setGroupModSuccess  
>> ``` 
>> {  
>> }  
>> ``` 
  
>> * setGroupModFailed  
>> ``` 
>> {  
>> }  
>> ``` 
  
###deleteGroup
Eine Gruppe löschen
> * deleteGroup  
> ``` 
> {  
>     user : 'Benutzername',  
>     name : 'Gruppenname'  
> }  
> ``` 
  
>> * deleteGroupSuccess  
>> ``` 
>> {  
>> }  
>> ``` 
  
>> * deleteGroupFailed  
>> ``` 
>> {  
>> }  
>> ``` 
  
## Lizenz