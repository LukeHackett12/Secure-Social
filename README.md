# Secure Social Network

## Introduction

For this assignment I chose to make my own social network using ReactJS. This
website would allow people to login using Google or Facebook. After they have logged
in/registered they are able to post from their profile page where there is a board of all posts
on the site. They also have the capability to add contacts via the ‘Contacts’ page.
All posts on the site are encrypted using AES symmetric keys. Each user has their
own ‘post key’ which they encrypt their posts with. The encryption works by exchanging
post keys between contacts securely, in such a way that no other party can read the posts.
Below I will outline each stage of this process in more detail.

## Application Pages

Login Page

The first thing the user does when they
access the site is login. When it is their first
time logging in, the users ‘post key’ is
generated. The post key is a randomly
generated AES-256 key. An RSA key pair is
also generated for the user. This key pair is
used to encrypt the post key when uploading
the post key to the database.

The RSA key pair also needs to be
uploaded to the database so it can persist
between user sessions. This is done by
encrypting the private key before uploading it
to the database. To encrypt the private key, we use AES. The key used to encrypt the private
key is generated based on the UID of the user, returned from the Oauth2 Google/Facebook
login. This is not stored in the database and ensures that even if you have access to the full
database you will not be able to access the private keys or post keys of any of the users.

Profile Page

The profile page has two main components to it, Profile information and the site
Posting Board. There is also a sidebar that is present in both the profile and contacts that
enables you to navigate the site and see incoming friend requests. The Post board component
listens for any incoming posts and will see if the post is from someone in your contacts. If the
poster is a contact the message will be decrypted and displayed as plaintext. Otherwise, the
cipher text will be displayed.

The page also displays user info, such as email, name, and number of friends as seen
below.


Contacts page

From this page you can see
any contacts you may have and also
add contacts via the ‘Add Contact’
button. This button opens a modal
where you can add other users that
have been registered on the site.

_Add Contacts Modal_

This is where the contact
request is made. This is done by
updating the database document of the
user that you want to be contacts with.
There will be an entry made in the
requests field with information about
the user that has requested to be
contacts. Once the request has been
sent it is up to the other user to accept it
before they are contacts.

## Backend Functionality


All data is stored in a Google Firestore database. The ReactJS based app has no built
in backend, it mainly makes requests to the Firestore database through Google’s API. The
Oauth sign in also uses firebase authentication to verify users on login.

Post Key Exchange

When a user requests to be contacts, this is when the exchange of the post keys
happens. There are 3 main stages to this which I will outline bellow. For ease, the user
sending the request is Alice, and Bob is the one accepting.

_Stage 1: Request Sent_

The web client need certain information to decrypt and display posts. This
information consists of Alice’s Name, Email, Post Key, and Public Key. Importantly the Post
Key is encrypted with Bob’s public key to ensure it is never stored in plain text when written
to the ‘users’ collection in the database.

_Stage 2 : Request Received_

There is a listener in the client that will notify of any changes to the users data. When
the request is written to the database Bob will therefore receive a notification that it is
pending.

When Bob accepts this request, he will first set the data in his own document. The
request was in an array of requests, now will be moved to the friends array. Next, he will
encrypt his post key with Alice’s public key and store all necessary information in a new
element of her friends array.

_Stage 3: Send to database_

Once all this data is received and collated it is uploaded to the ‘users’ collection in the
database and the exchange is finished. They are now able to communicate via the post board
and will show up in each other’s contact list.

The data in the database for each user is represented as follows:


Post Encryption/Decryption

_Encryption_

When posting, the user inputs the text that they want to post. Once they click the send
button it is encrypted using their AES-256 key and uploaded to the ‘posts’ collection in the
database. This collection is accessible to any user of the app so all users will be able to see
who has posted and when. They will not be able to see the contents without the post key
however.

_Decryption_

When the PostBoard component receives a new post it will check to see if the poster
is a friend, and if so will decrypt with the post key that it has been given. The successfully
decrypted message will be displayed. If the poster is not in the friends list, than the post will
be displayed as encrypted text.


The posts are stored in the database in the following format:

## Code

The code can be found on Github here:

https://github.com/LukeHackett12/College/tree/master/3rd%20Year/Advanced%20Telecom
munications/secure-social

A recording of the site interactions can be found here:

https://github.com/LukeHackett12/College/raw/master/3rd%20Year/Advanced%20Telecom
munications/secure-social/Runthrough.mov


