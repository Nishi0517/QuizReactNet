import React, { useEffect, useState } from 'react'
import useStateContext from '../hooks/useStateContext'
import { ENDPOINT, createAPIEndpoint } from '../api';
import { Alert, Box, Button, Card, CardContent, CardMedia, Typography } from '@mui/material';
import { getFormatedTime } from '../helper';
import { useNavigate } from 'react-router-dom';
import { green,blue } from '@mui/material/colors';
import Answer from './Answer';

export default function Result() {

  const {context, setContext} = useStateContext();
  const [score, setScore ] = useState(0)
  const [ qnAnswers , setQnAnswers ] = useState([])
  const [showAlert, setShowAlert] = useState(false)
  const navigate = useNavigate()

  useEffect(()=>{
    const ids= context.selectedOptions.map(x => x.qnId)
    createAPIEndpoint(ENDPOINT.getAnswers)
    .post(ids)
    .then(res=>{
      console.log(res.data)
      const qna = context.selectedOptions
        .map(x=> ({
          ...x,
          ...(res.data.find(y => y.qnId == x.qnId))
        }))
        setQnAnswers(qna)
        calculateScore(qna)
    })
    .catch(err=>console.log())
  },[])

  const calculateScore = qna => {
    let tempScore = qna.reduce((acc,curr)=>{
      return curr.answer == curr.selected ? acc + 1 : acc;
    },0)
    setScore(tempScore)
  }

  const submitscore = () =>{
    createAPIEndpoint(ENDPOINT.participant)
      .put(context.participantId,{
        participantId:context.participantId,
        score: score,
        timetaken: context.timeTaken
      })
      .then(res => {
        setShowAlert(true)
        setTimeout(()=>{
          setShowAlert(false)
        },4000)
       } )
      .catch(err => { console.log(err) })
  }

  const restart = () =>{
    setContext({
      timeTaken:0,
      selectedOptions:[]
    }) 
    navigate("/quiz")
  }

  return (
    <>
    <Card sx={{ mt:5, display:'flex', width:'100%', maxWidth:640, mx:'auto'}}>
      <Box sx={{ display:'flex', flexDirection:'column', flexGrow:1 }}>
        <CardContent sx={{ flex:'1 0 auto',textAlign: 'center' }}>
          <Typography variant='h4'>Congratulations!</Typography>
          <Typography variant='h5'>YOUR SCORE</Typography>
          <Typography variant='h4' sx={{ fontWeight:600 }}>
            <Typography variant='span' color={green[500]}>
              {score}
            </Typography>/5
          </Typography>
          <Typography variant='h6'>
              Took {getFormatedTime(context.timeTaken) + ' mins'}
          </Typography>
          <Button variant="contained"
            sx = {{ mx: 1 }}
            size = "small"
            onClick={submitscore}>
            Submit
          </Button>
          <Button variant='contained'
            sx= {{ mx:1 }}
            size="small"
            onClick={restart}>
            Re-Try
          </Button>
          <Alert severity='success'
            variant='string'
            sx={{width : '50%',
                 m:'auto',
                 color: green[500],
                 visibility: showAlert ? 'visible' :'hidden'  
          }}>Score Updated.</Alert>
        </CardContent>
      </Box>
      <CardMedia
        component="img"
        sx={{width:220}}
        image="./result.png"
      />
    </Card>
    <Answer qnAnswers={qnAnswers} />
    </>
  )
}
