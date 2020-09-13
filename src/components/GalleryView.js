import React, { useState, useEffect } from 'react'
import { app } from "../firebase"
import { DropzoneDialog } from 'material-ui-dropzone';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';

const db = app.firestore()

const useStyles = makeStyles((theme) => ({
    gallery: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.paper,
    },
    button: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        backgroundColor: "#2110c2",
    },
    gridList: {
        width: "100%",
        height: "100%",
    },
    title: {
        flexGrow: 1,
    },
    navbar: {
        flexGrow: 1
    },
    images: {
        borderStyle: "outset",
        borderRadius: "10px"
    }
}));

const Gallery = () => {
    const classes = useStyles()
    const [open, setOpen] = useState(false) // Defined for popup menu
    const [images, setImages] = useState()
    const fileUrlList = []

    useEffect(() => {
        const fetchImages = async () => {
            const imageCollection = await db.collection("images").get() // Fetching images from Firestore
            setImages(imageCollection.docs.map(doc => { // Setting previously fetched images into images state
                return doc.data()
            }))
        }
        fetchImages()
    }, [fileUrlList])

    return (
        <>
            <div className={classes.navbar}>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" className={classes.title}> React Gallery App </Typography>
                        <Button variant="contained" color="primary" className={classes.button} onClick={() => setOpen(true)}><AddIcon />Upload </Button>
                    </Toolbar>
                </AppBar>
            </div>
            <div className={classes.gallery}>
                <DropzoneDialog
                    acceptedFiles={['image/*']}
                    cancelButtonText={"cancel"}
                    submitButtonText={"submit"}
                    maxFileSize={5000000}
                    open={open}
                    onClose={() => setOpen(false)}
                    onSave={async (files) => {
                        files.forEach(async (file) => {
                            const storageRef = app.storage().ref()
                            const fileRef = storageRef.child(file.name)

                            await fileRef.put(file) // Pushing images to Firebase storage

                            fileUrlList.push(await fileRef.getDownloadURL()) // Getting download URL from Firebase storage into an array to show ahead

                            await fileUrlList.forEach((image) => { // Pushing every image URL to the Firestore with unique IDs
                                db.collection("images").doc().set({
                                    image: image
                                })
                            })
                        })
                        setOpen(false);
                    }}
                    showPreviews={true}
                    showFileNamesInPreview={true}
                    getDropRejectMessage={() => { alert("You can only upload images!") }} // Alert message for invalid file format
                />
                <GridList cellHeight={"auto"} className={classes.gridList}>
                    {images !== undefined // If there's images in Firestore, it'll be appeared on GridList
                        ? images.map(item => {
                            return (
                                <GridListTile className={classes.images}>
                                    <img src={item.image} alt="" height="100%" width="100%" />
                                </GridListTile>
                            )
                        })
                        : null}
                </GridList>
            </div>
        </>
    )
}

export default Gallery;